
import React from "react";
import { Button } from "@/components/ui/button";

export function DraftFeedbackDiscussion({
  sectionPrompts,
  handleSubmitPromptFeedback,
}: any) {
  return (
    Object.entries(sectionPrompts).some(([_, prompts]) => 
      prompts.questions.some((q: any) => q.isAnswered)
    ) && (
      <div className="mt-4 p-3 border rounded-md bg-muted/20">
        <h4 className="font-medium text-sm mb-2">Discussion answers</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Submit discussion answers as feedback to improve the next draft generation.
        </p>
        <div className="space-y-2">
          {Object.entries(sectionPrompts).map(([sectionIdxStr, prompts]: any) => {
            const sectionIdx = parseInt(sectionIdxStr);
            const answeredCount = prompts.questions.filter((q: any) => q.isAnswered).length;

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
