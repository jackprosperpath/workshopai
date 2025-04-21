
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { v4 as uuidv4 } from "uuid";

export type DiscussionPrompt = {
  id: string;
  question: string;
  answers: string[];
  isAnswered: boolean;
};

export function useDocumentDiscussionPrompts(workshopId: string | null) {
  const [prompts, setPrompts] = useState<DiscussionPrompt[]>([]);
  const [documentHash, setDocumentHash] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<Date | null>(null);

  // Load cached prompts from localStorage
  useEffect(() => {
    if (!workshopId) return;
    
    try {
      const cached = localStorage.getItem(`workshop-doc-prompts-${workshopId}`);
      if (cached) {
        const { prompts, documentHash, timestamp } = JSON.parse(cached);
        setPrompts(prompts);
        setDocumentHash(documentHash);
        setLastGeneratedAt(new Date(timestamp));
      }
    } catch (error) {
      console.error("Error loading cached document prompts:", error);
      // Clear potentially corrupted cache
      localStorage.removeItem(`workshop-doc-prompts-${workshopId}`);
    }
  }, [workshopId]);

  // Save prompts to localStorage when they change
  useEffect(() => {
    if (!workshopId || !documentHash || prompts.length === 0) return;
    
    try {
      localStorage.setItem(`workshop-doc-prompts-${workshopId}`, JSON.stringify({
        prompts,
        documentHash,
        timestamp: lastGeneratedAt?.toISOString() || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error saving cached document prompts:", error);
    }
  }, [prompts, documentHash, lastGeneratedAt, workshopId]);

  const generatePrompts = useCallback(async (fullText: string) => {
    if (!fullText?.trim()) {
      console.log("Empty document text, skipping prompt generation");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the edge function to generate prompts for the entire document
      const { data, error } = await supabase.functions.invoke('generate-discussion-prompts', {
        body: { fullText }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      console.log("Received document-level prompt data:", data);
      
      if (!Array.isArray(data.questions)) {
        console.error("Invalid response format, expected array of questions:", data.questions);
        throw new Error("Invalid response format");
      }
      
      // Update state with the new prompts
      setPrompts(data.questions.map((q: string, i: number) => ({
        id: uuidv4(),
        question: q,
        answers: [],
        isAnswered: false
      })));
      
      setDocumentHash(data.documentHash);
      setLastGeneratedAt(new Date());
      
      return data.questions;
    } catch (error) {
      console.error("Error generating document discussion prompts:", error);
      
      // Set default questions in case of error
      const defaultQuestions = [
        "What assumptions is this solution making?",
        "What challenges might arise during implementation?",
        "Is there anything missing from this recommendation?"
      ];
      
      setPrompts(defaultQuestions.map((q) => ({
        id: uuidv4(),
        question: q,
        answers: [],
        isAnswered: false
      })));
      
      toast.error("Failed to generate discussion prompts", {
        description: "Using default questions instead"
      });
      
      return defaultQuestions;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const addAnswer = useCallback((promptId: string, answer: string) => {
    setPrompts(prev => prev.map(p => 
      p.id === promptId
        ? { ...p, answers: [...p.answers, answer], isAnswered: true }
        : p
    ));
  }, []);
  
  return {
    prompts,
    isLoading,
    documentHash,
    lastGeneratedAt,
    generatePrompts,
    addAnswer
  };
}
