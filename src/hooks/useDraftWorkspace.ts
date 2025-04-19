import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import type { AiModel } from "./usePromptCanvas";
import type { OutputFormat } from "@/types/OutputFormat";

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
  
  const currentDraft = currentIdx !== null && versions.length > 0 
    ? versions[currentIdx] 
    : null;

  // Load drafts from localStorage
  const loadDrafts = (workshopId: string) => {
    try {
      const savedDrafts = localStorage.getItem(`workshop-drafts-${workshopId}`);
      if (savedDrafts) {
        const parsedDrafts = JSON.parse(savedDrafts) as {
          versions: DraftVersion[];
          currentIdx: number | null;
        };
        setVersions(parsedDrafts.versions);
        setCurrentIdx(parsedDrafts.currentIdx);
      }
    } catch (error) {
      console.error('Error loading drafts from localStorage:', error);
    }
  };

  // Save drafts to localStorage whenever versions or currentIdx changes
  useEffect(() => {
    if (versions.length > 0) {
      const workshopId = new URLSearchParams(window.location.search).get('id');
      if (workshopId) {
        localStorage.setItem(`workshop-drafts-${workshopId}`, JSON.stringify({
          versions,
          currentIdx
        }));
      }
    }
  }, [versions, currentIdx]);

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
    format: OutputFormat,
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
          format,
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

      const newVersions = [...versions, next];
      setVersions(newVersions);
      setCurrentIdx(newVersions.length - 1);
      
      // Save to localStorage
      const workshopId = new URLSearchParams(window.location.search).get('id');
      if (workshopId) {
        localStorage.setItem(`workshop-drafts-${workshopId}`, JSON.stringify({
          versions: newVersions,
          currentIdx: newVersions.length - 1
        }));
      }
      
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
    loadDrafts,
  };
}
