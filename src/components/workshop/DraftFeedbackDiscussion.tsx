
import React from "react";
import { Button } from "@/components/ui/button";

// Define proper types for the section prompts
type DiscussionPrompt = {
  id: string;
  question: string;
  answers: string[];
  isAnswered: boolean;
};

type SectionPrompt = {
  questions: DiscussionPrompt[];
  sectionHash: string;
  isLoading: boolean;
  isVisible: boolean;
};

type SectionPrompts = {
  [sectionIdx: number]: SectionPrompt;
};

type DraftFeedbackDiscussionProps = {
  sectionPrompts: SectionPrompts;
  handleSubmitPromptFeedback: (sectionIdx: number) => void;
};

export function DraftFeedbackDiscussion({
  sectionPrompts,
  handleSubmitPromptFeedback,
}: DraftFeedbackDiscussionProps) {
  return (
    Object.entries(sectionPrompts).some(([_, prompts]) => 
      prompts.questions.some((q: DiscussionPrompt) => q.isAnswered)
    ) && (
      <div className="mt-4 p-3 border rounded-md bg-muted/20">
        <h4 className="font-medium text-sm mb-2">Discussion answers</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Submit discussion answers as feedback to improve the next draft generation.
        </p>
        <div className="space-y-2">
          {Object.entries(sectionPrompts).map(([sectionIdxStr, prompts]: [string, SectionPrompt]) => {
            const sectionIdx = parseInt(sectionIdxStr);
            const answeredCount = prompts.questions.filter((q) => q.isAnswered).length;

            if (answeredCount === 0) return null;

            return (
              <div key={sectionIdxStr} className="flex justify-between items-center">
                <span className="text-sm">
                  Section {sectionIdx + 1}: {answeredCount} answered
                </span>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => handleSubmitPromptFeedback(sectionIdx)}
                >
                  Submit as feedback
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    )
  );
}
