
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import type { AiModel } from "./usePromptCanvas";

export type SectionFeedback = {
  text: string;
  threadId: number;
};

export type DraftVersion = {
  id: number;
  output: string[];
  reasoning: string;
  sectionFeedback: Record<number, SectionFeedback[]>;
};

export function useDraftWorkspace() {
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeThread, setActiveThread] = useState<number | null>(null);
  const threadCounter = useRef(1);

  const currentDraft = currentIdx !== null ? versions[currentIdx] : null;

  // Set up real-time updates for draft editing
  useEffect(() => {
    if (!currentDraft) return;

    const workshopId = new URLSearchParams(window.location.search).get('id');
    if (!workshopId) return;

    const channel = supabase.channel(`draft-edits-${workshopId}`);
    
    channel
      .on('broadcast', { event: 'draft_edit' }, (payload) => {
        const { draftId, sectionIdx, content, userId } = payload.payload as any;
        
        if (draftId === currentDraft.id) {
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
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDraft]);

  const generateDraft = async (
    problem: string,
    metrics: string[],
    constraints: string[],
    model: AiModel = "gpt-4o-mini"
  ) => {
    if (!problem.trim()) {
      toast.error("Please provide a problem statement");
      return;
    }

    setLoading(true);

    try {
      // Get feedback from current draft if it exists
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
          model
        }
      });

      if (error) throw error;

      const next: DraftVersion = {
        id: versions.length + 1,
        output: data.output,
        reasoning: data.reasoning || (consolidatedFeedback ? "Generated with feedback incorporated" : "Initial generation"),
        sectionFeedback: {}
      };

      setVersions((prev) => [...prev, next]);
      setCurrentIdx(versions.length);
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
    
    // Broadcast feedback to other users
    const workshopId = new URLSearchParams(window.location.search).get('id');
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
    
    // Apply optimistic update locally
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
    
    // Broadcast changes to other users
    const workshopId = new URLSearchParams(window.location.search).get('id');
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
  };
}
