
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type DiscussionPrompt = {
  id: string;
  question: string;
  answers: string[];
  isAnswered: boolean;
};

type SectionPrompts = {
  [sectionIdx: number]: {
    questions: DiscussionPrompt[];
    sectionHash: string;
    isLoading: boolean;
    isVisible: boolean;
  };
};

export function useDiscussionPrompts(workshopId: string | null) {
  const [sectionPrompts, setSectionPrompts] = useState<SectionPrompts>({});
  const [cachedPrompts, setCachedPrompts] = useState<Record<string, string[]>>({});

  // Load cached prompts from localStorage
  useEffect(() => {
    if (!workshopId) return;
    
    try {
      const cached = localStorage.getItem(`workshop-prompts-${workshopId}`);
      if (cached) {
        setCachedPrompts(JSON.parse(cached));
      }
    } catch (error) {
      console.error("Error loading cached prompts:", error);
    }
  }, [workshopId]);

  // Save cachedPrompts to localStorage when it changes
  useEffect(() => {
    if (!workshopId || Object.keys(cachedPrompts).length === 0) return;
    localStorage.setItem(`workshop-prompts-${workshopId}`, JSON.stringify(cachedPrompts));
  }, [cachedPrompts, workshopId]);

  const generatePrompts = async (sectionIdx: number, sectionText: string) => {
    if (!sectionText.trim()) return;
    
    // Generate a simple hash of the section text
    const sectionHash = btoa(sectionText.substring(0, 50)).substring(0, 10);
    
    // Check if we have cached prompts for this section text
    if (cachedPrompts[sectionHash]) {
      setSectionPrompts(prev => ({
        ...prev,
        [sectionIdx]: {
          questions: cachedPrompts[sectionHash].map((q, i) => ({
            id: `${sectionIdx}-${i}`,
            question: q,
            answers: [],
            isAnswered: false
          })),
          sectionHash,
          isLoading: false,
          isVisible: false
        }
      }));
      return;
    }
    
    // Set loading state
    setSectionPrompts(prev => ({
      ...prev,
      [sectionIdx]: {
        ...prev[sectionIdx] || {},
        isLoading: true,
        questions: prev[sectionIdx]?.questions || [],
        sectionHash: prev[sectionIdx]?.sectionHash || "",
        isVisible: prev[sectionIdx]?.isVisible || false
      }
    }));
    
    try {
      // Call the edge function to generate prompts
      const { data, error } = await supabase.functions.invoke('generate-discussion-prompts', {
        body: { sectionText }
      });
      
      if (error) throw error;
      
      const promptQuestions = data.questions;
      
      // Cache the prompts
      setCachedPrompts(prev => ({
        ...prev,
        [sectionHash]: promptQuestions
      }));
      
      // Update state with the new prompts
      setSectionPrompts(prev => ({
        ...prev,
        [sectionIdx]: {
          questions: promptQuestions.map((q: string, i: number) => ({
            id: `${sectionIdx}-${i}`,
            question: q,
            answers: [],
            isAnswered: false
          })),
          sectionHash,
          isLoading: false,
          isVisible: false
        }
      }));
    } catch (error) {
      console.error("Error generating discussion prompts:", error);
      toast.error("Failed to generate discussion prompts");
      
      // Set default questions in case of error
      const defaultQuestions = [
        "What assumptions is this section making?",
        "What challenges might arise during implementation?",
        "Is there anything missing from this recommendation?"
      ];
      
      setSectionPrompts(prev => ({
        ...prev,
        [sectionIdx]: {
          questions: defaultQuestions.map((q, i) => ({
            id: `${sectionIdx}-${i}`,
            question: q,
            answers: [],
            isAnswered: false
          })),
          sectionHash,
          isLoading: false,
          isVisible: false
        }
      }));
    }
  };
  
  const togglePromptsVisibility = (sectionIdx: number) => {
    setSectionPrompts(prev => ({
      ...prev,
      [sectionIdx]: {
        ...prev[sectionIdx],
        isVisible: !prev[sectionIdx]?.isVisible
      }
    }));
  };
  
  const addAnswer = (sectionIdx: number, promptId: string, answer: string) => {
    setSectionPrompts(prev => {
      const section = prev[sectionIdx];
      if (!section) return prev;
      
      return {
        ...prev,
        [sectionIdx]: {
          ...section,
          questions: section.questions.map(q => 
            q.id === promptId
              ? { ...q, answers: [...q.answers, answer], isAnswered: true }
              : q
          )
        }
      };
    });
  };
  
  const getPromptAnswers = (sectionIdx: number) => {
    const section = sectionPrompts[sectionIdx];
    if (!section) return [];
    
    return section.questions
      .filter(q => q.isAnswered)
      .map(q => ({
        question: q.question,
        answers: q.answers
      }));
  };

  return {
    sectionPrompts,
    generatePrompts,
    togglePromptsVisibility,
    addAnswer,
    getPromptAnswers
  };
}
