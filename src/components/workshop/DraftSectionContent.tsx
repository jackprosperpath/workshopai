
import React from "react";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Lightbulb } from "lucide-react";
import { Comment } from "./CommentsPanel";

interface DraftSectionContentProps {
  para: string;
  idx: number;
  editingSection: number | null;
  isUserEditingSection: (sectionIdx: number) => boolean;
  highlightChanges: (text: string, idx: number) => React.ReactNode;
  comments: Comment[];
  activeComment: string | null;
  setActiveComment: (id: string | null) => void;
  sectionRef: React.RefObject<HTMLDivElement>;
  onEditStart: (idx: number, content: string) => void;
  discussionPrompts?: {
    questions: any[];
    isLoading: boolean;
    isVisible: boolean;
  };
  onTogglePrompts?: () => void;
  onAddPromptAnswer?: (promptId: string, answer: string) => void;
}

export const DraftSectionContent: React.FC<DraftSectionContentProps> = ({
  para,
  idx,
  editingSection,
  isUserEditingSection,
  highlightChanges,
  comments,
  activeComment,
  setActiveComment,
  sectionRef,
  onEditStart,
  discussionPrompts,
  onTogglePrompts,
  onAddPromptAnswer
}) => {
  // Filter comments for this section
  const sectionComments = comments.filter(comment => comment.selection.sectionIndex === idx);

  // Highlight text with comments
  const renderContentWithCommentHighlights = () => {
    if (sectionComments.length === 0 || editingSection === idx) {
      return highlightChanges(para, idx);
    }

    let content = para;
    const parts: React.ReactNode[] = [];

    // Sort comments by their position to handle overlapping highlights
    const sortedComments = [...sectionComments].sort((a, b) => a.selection.startOffset - b.selection.startOffset);

    let lastIndex = 0;

    sortedComments.forEach((comment) => {
      const { startOffset, endOffset } = comment.selection;

      // Add text before the highlighted part
      if (startOffset > lastIndex) {
        parts.push(content.substring(lastIndex, startOffset));
      }

      // Add the highlighted part
      const highlightedText = content.substring(startOffset, endOffset);
      const isActive = activeComment === comment.id;

      parts.push(
        <span
          key={`highlight-${comment.id}`}
          className={`relative cursor-pointer ${isActive ? 'bg-yellow-200' : 'bg-yellow-100'}`}
          onClick={() => setActiveComment(comment.id)}
        >
          {highlightedText}
        </span>
      );

      lastIndex = endOffset;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  // Count AI discussion prompts for this section
  const hasDiscussionPrompts = discussionPrompts && discussionPrompts.questions && discussionPrompts.questions.length > 0;
  const answeredPromptsCount = hasDiscussionPrompts 
    ? discussionPrompts.questions.filter(q => q.isAnswered).length 
    : 0;

  return (
    <div
      ref={sectionRef}
      className={`p-2 rounded relative transition ${
        isUserEditingSection(idx) && editingSection !== idx
          ? "bg-yellow-50 border border-yellow-200"
          : ""
      } group/section`}
      onClick={() => {
        if (editingSection === null) {
          onEditStart(idx, para);
        }
      }}
    >
      {renderContentWithCommentHighlights()}
      <div className="flex items-center mt-2 gap-2">
        {sectionComments.length > 0 && (
          <Badge variant="outline" className="flex items-center gap-1 h-7 px-2">
            <MessageSquare className="h-3 w-3" />
            {sectionComments.length}
          </Badge>
        )}
        
        {answeredPromptsCount > 0 && (
          <Badge variant="outline" className="flex items-center gap-1 h-7 px-2 bg-primary/10">
            <Lightbulb className="h-3 w-3" />
            {answeredPromptsCount} answered
          </Badge>
        )}
      </div>
    </div>
  );
};
