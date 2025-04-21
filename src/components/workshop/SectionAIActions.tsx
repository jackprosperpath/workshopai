
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SectionAIActionsProps {
  improveResult: { newText: string; reasoning?: string } | null;
  improving: null | "redraft" | "add_detail" | "simplify";
  onDiscard: () => void;
  onApply: () => void;
  applyingChanges: boolean;
}

export const SectionAIActions: React.FC<SectionAIActionsProps> = ({
  improveResult,
  improving,
  onDiscard,
  onApply,
  applyingChanges,
}) => {
  if (improving) {
    return (
      <div className="absolute left-0 top-0 right-0 flex flex-col z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#1A1F2C] p-3 rounded-md text-xs text-white shadow border border-slate-700 mb-2 select-none pointer-events-auto">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Improving section with AI ({improving.replace("_", " ")}&hellip;)</span>
        </div>
      </div>
    );
  }

  if (improveResult) {
    return (
      <div className="bg-slate-50 border border-slate-200 p-2 rounded mt-2 text-xs">
        <div className="mb-2 font-medium">AI Suggestion:</div>
        <div
          className="mb-1 text-gray-900"
          dangerouslySetInnerHTML={{ __html: improveResult.newText }}
        />
        {improveResult.reasoning && (
          <div className="text-gray-500 mt-1">
            <em>Reasoning: {improveResult.reasoning}</em>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button
            size="sm"
            onClick={onApply}
            disabled={applyingChanges}
          >
            {applyingChanges ? "Applying..." : "Apply Changes"}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
