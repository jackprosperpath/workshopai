
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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

  const generateDraft = async (
    problem: string,
    metrics: string[],
    constraints: string[],
    feedback: string | null = null
  ) => {
    if (!problem.trim()) {
      toast.error("Please provide a problem statement");
      return;
    }

    setLoading(true);

    try {
      let consolidatedFeedback = '';
      if (feedback && currentDraft) {
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
          feedback: consolidatedFeedback || null
        }
      });

      if (error) throw error;

      const next: DraftVersion = {
        id: versions.length + 1,
        output: data.output,
        reasoning: data.reasoning || feedback || "Initial generation",
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
  };
}
