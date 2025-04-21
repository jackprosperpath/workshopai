
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageCircle } from "lucide-react";
import { Badge as FeedbackBadge } from "@/components/ui/badge";
import type { SectionFeedback } from "@/hooks/useDraftWorkspace";

type SectionFeedbackButtonProps = {
  idx: number;
  sectionFeedback: SectionFeedback[];
  activeThread: number | null;
  onClick: () => void;
};

export function SectionFeedbackButton({
  idx,
  sectionFeedback,
  activeThread,
  onClick,
}: SectionFeedbackButtonProps) {
  const firstFeedbackLine =
    sectionFeedback && sectionFeedback.length > 0
      ? sectionFeedback[0].text.split('\n')[0].slice(0, 60)
      : "";

  const hasFeedback = sectionFeedback.length > 0;
  const showTooltip = hasFeedback && activeThread !== idx;

  return (
    <TooltipProvider>
      <Tooltip disableHoverableContent={!showTooltip}>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7 px-2 rounded-full relative"
            onClick={onClick}
            tabIndex={0}
            aria-label="Comments"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            {activeThread === idx ? "Hide" : "Comment"}
            {/* Show unread badge only if feedback exists and the thread is not active */}
            {hasFeedback && activeThread !== idx && (
              <FeedbackBadge
                variant="default"
                className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 text-[10px] h-4 px-1"
              >
                {sectionFeedback.length}
              </FeedbackBadge>
            )}
          </Button>
        </TooltipTrigger>
        {/* Show preview in tooltip only if feedback exists and not currently opened */}
        {showTooltip && (
          <TooltipContent side="top" className="max-w-xs">
            <span className="block text-xs">
              {firstFeedbackLine}
              {sectionFeedback.length > 1 && (
                <span className="text-muted-foreground ml-2">
                  +{sectionFeedback.length - 1} more
                </span>
              )}
            </span>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export default SectionFeedbackButton;
