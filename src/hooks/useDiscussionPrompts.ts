
import { useState, useEffect, useCallback } from "react";
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
  const [apiCallsInProgress, setApiCallsInProgress] = useState<Record<string, boolean>>({});
  const [errorSections, setErrorSections] = useState<Record<string, number>>({});

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
      // Clear potentially corrupted cache
      localStorage.removeItem(`workshop-prompts-${workshopId}`);
    }
  }, [workshopId]);

  // Save cachedPrompts to localStorage when it changes
  useEffect(() => {
    if (!workshopId || Object.keys(cachedPrompts).length === 0) return;
    try {
      localStorage.setItem(`workshop-prompts-${workshopId}`, JSON.stringify(cachedPrompts));
    } catch (error) {
      console.error("Error saving cached prompts:", error);
    }
  }, [cachedPrompts, workshopId]);

  const generatePrompts = useCallback(async (sectionIdx: number, sectionText: string) => {
    if (!sectionText?.trim()) return;
    
    // Generate a simple hash of the section text for caching
    const sectionHash = btoa(sectionText.substring(0, 50)).substring(0, 10);
    
    // Check if this section already has an API call in progress
    if (apiCallsInProgress[sectionHash]) {
      console.log("API call already in progress for section", sectionIdx);
      return;
    }
    
    // Check for error cooldown
    const lastErrorTime = errorSections[sectionHash] || 0;
    const now = Date.now();
    if (lastErrorTime > 0 && now - lastErrorTime < 30000) { // 30 second cooldown
      console.log("Error cooldown active for section", sectionIdx);
      toast.info("Discussions temporarily unavailable for this section");
      return;
    }
    
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
          isVisible: true // Set visible by default when loading from cache
        }
      }));
      return;
    }
    
    // Set loading state and mark API call as in progress
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
    setApiCallsInProgress(prev => ({ ...prev, [sectionHash]: true }));
    
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
          isVisible: true
        }
      }));
      
      // Reset error state for this section
      if (errorSections[sectionHash]) {
        setErrorSections(prev => {
          const newState = { ...prev };
          delete newState[sectionHash];
          return newState;
        });
      }
    } catch (error) {
      console.error("Error generating discussion prompts:", error);
      
      // Mark this section as having an error to implement cooldown
      setErrorSections(prev => ({
        ...prev,
        [sectionHash]: Date.now()
      }));
      
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
          isVisible: true
        }
      }));
      
      toast.error("Failed to generate discussion prompts", {
        description: "Using default questions instead"
      });
    } finally {
      // Mark API call as complete
      setApiCallsInProgress(prev => {
        const newState = { ...prev };
        delete newState[sectionHash];
        return newState;
      });
    }
  }, [apiCallsInProgress, cachedPrompts, errorSections]);
  
  const togglePromptsVisibility = useCallback((sectionIdx: number) => {
    setSectionPrompts(prev => ({
      ...prev,
      [sectionIdx]: {
        ...prev[sectionIdx],
        isVisible: !prev[sectionIdx]?.isVisible
      }
    }));
  }, []);
  
  const addAnswer = useCallback((sectionIdx: number, promptId: string, answer: string) => {
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
  }, []);
  
  const getPromptAnswers = useCallback((sectionIdx: number) => {
    const section = sectionPrompts[sectionIdx];
    if (!section) return [];
    
    return section.questions
      .filter(q => q.isAnswered)
      .map(q => ({
        question: q.question,
        answers: q.answers
      }));
  }, [sectionPrompts]);

  return {
    sectionPrompts,
    generatePrompts,
    togglePromptsVisibility,
    addAnswer,
    getPromptAnswers
  };
}
