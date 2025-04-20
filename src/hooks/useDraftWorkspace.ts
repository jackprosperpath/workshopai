import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import type { AiModel } from "./usePromptCanvas";
import type { OutputFormat } from "@/types/OutputFormat";
import { useSearchParams } from "react-router-dom";

export type SectionFeedback = {
  text: string;
  threadId: number;
};

export type DraftVersion = {
  id: number;
  output: string[];
  reasoning: string;
  sectionFeedback: Record<number, SectionFeedback[]>;
  isFinal?: boolean;
};

export function useDraftWorkspace() {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeThread, setActiveThread] = useState<number | null>(null);
  const threadCounter = useRef(1);
  const previousWorkshopId = useRef<string | null>(null);
  
  const currentDraft = currentIdx !== null && versions.length > 0 
    ? versions[currentIdx] 
    : null;

  useEffect(() => {
    if (workshopId !== previousWorkshopId.current) {
      setVersions([]);
      setCurrentIdx(null);
      
      if (workshopId) {
        loadDrafts(workshopId);
        previousWorkshopId.current = workshopId;
      }
    }
  }, [workshopId]);

  const loadDrafts = async (workshopId?: string) => {
    if (!workshopId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('workshop_drafts')
        .select('*')
        .eq('workshop_id', workshopId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('No existing drafts found for workshop:', workshopId);
        return;
      }

      if (data) {
        const parsedVersions = JSON.parse(data.versions.toString());
        setVersions(parsedVersions);
        setCurrentIdx(data.current_idx !== null ? data.current_idx : null);
      }
    } catch (error) {
      console.error('Error loading drafts from Supabase:', error);
    }
  };

  useEffect(() => {
    const saveDraftsToSupabase = async () => {
      if (!workshopId || versions.length === 0) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('workshop_drafts')
          .upsert({
            workshop_id: workshopId,
            user_id: user.id,
            versions: JSON.stringify(versions),
            current_idx: currentIdx
          }, {
            onConflict: 'workshop_id, user_id'
          });

        if (error) {
          console.error('Error saving drafts to Supabase:', error);
        }
      } catch (error) {
        console.error('Error saving drafts to Supabase:', error);
      }
    };

    const timeoutId = setTimeout(saveDraftsToSupabase, 500);
    return () => clearTimeout(timeoutId);
  }, [versions, currentIdx, workshopId]);

  const generateDraft = async (
    problem: string,
    metrics: string[],
    constraints: string[],
    format: OutputFormat,
    model: AiModel = "gpt-4o-mini"
  ) => {
    if (!problem.trim()) {
      toast.error("Please provide a problem statement");
      return;
    }

    setLoading(true);

    try {
      let consolidatedFeedback = '';
      if (currentDraft) {
        Object.entries(currentDraft.sectionFeedback).forEach(([sectionIdx, comments]) => {
          const sectionContent = currentDraft.output[Number(sectionIdx)];
          consolidatedFeedback += `\nFeedback for section "${sectionContent.slice(0, 50)}...":\n`;
          comments.forEach(fb => {
            consolidatedFeedback += `- ${fb.text}\n`;
          });
        });
      }

      const { data, error } = await supabase.functions.invoke('workshop-ai', {
        body: {
          problem,
          metrics,
          constraints,
          feedback: consolidatedFeedback || null,
          format,
          model
        }
      });

      if (error) throw error;

      const next: DraftVersion = {
        id: versions.length + 1,
        output: data.output,
        reasoning: data.reasoning || (consolidatedFeedback ? "Generated with feedback incorporated" : "Initial generation"),
        sectionFeedback: {},
        isFinal: false
      };

      const newVersions = [...versions, next];
      setVersions(newVersions);
      setCurrentIdx(newVersions.length - 1);
      
      toast.success("New draft generated");
    } catch (error) {
      console.error('Error generating draft:', error);
      toast.error("Failed to generate draft");
    } finally {
      setLoading(false);
    }
  };

  const addFeedback = (sectionIdx: number, text: string) => {
    if (!currentDraft) return;
    const id = threadCounter.current++;
    const feedback: SectionFeedback = { text, threadId: id };

    setVersions((prev) =>
      prev.map((v) =>
        v.id === currentDraft.id
          ? {
              ...v,
              sectionFeedback: {
                ...v.sectionFeedback,
                [sectionIdx]: [
                  ...(v.sectionFeedback[sectionIdx] || []),
                  feedback
                ]
              }
            }
          : v
      )
    );
    
    if (workshopId) {
      supabase.channel(`workshop:${workshopId}`)
        .send({
          type: 'broadcast',
          event: 'feedback_added',
          payload: {
            draftId: currentDraft.id,
            sectionIdx,
            feedback
          }
        });
    }
  };

  const updateDraftSection = async (draftId: number, sectionIdx: number, content: string) => {
    if (currentIdx === null) return;
    
    setVersions(prev => 
      prev.map(v => {
        if (v.id === draftId) {
          const newOutput = [...v.output];
          newOutput[sectionIdx] = content;
          return { ...v, output: newOutput };
        }
        return v;
      })
    );
    
    if (workshopId) {
      const { data } = await supabase.auth.getUser();
      await supabase.channel(`workshop:${workshopId}`)
        .send({
          type: 'broadcast',
          event: 'draft_edit',
          payload: {
            draftId,
            sectionIdx,
            content,
            userId: data.user?.id
          }
        });
    }
    
    return true;
  };

  return {
    versions,
    currentIdx,
    setCurrentIdx,
    loading,
    activeThread,
    setActiveThread,
    currentDraft,
    generateDraft,
    addFeedback,
    updateDraftSection,
    loadDrafts,
  };
}
