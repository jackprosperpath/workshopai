
import React from "react";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
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
}) => {
  const sectionComments = comments.filter(comment => comment.selection.sectionIndex === idx);

  const renderContentWithCommentHighlights = () => {
    if (sectionComments.length === 0 || editingSection === idx) {
      return highlightChanges(para, idx);
    }

    let content = para;
    const parts: React.ReactNode[] = [];

    const sortedComments = [...sectionComments].sort((a, b) => a.selection.startOffset - b.selection.startOffset);

    let lastIndex = 0;

    sortedComments.forEach((comment) => {
      const { startOffset, endOffset } = comment.selection;

      if (startOffset > lastIndex) {
        parts.push(content.substring(lastIndex, startOffset));
      }

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

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

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
      
      {sectionComments.length > 0 && (
        <div className="flex items-center mt-2 gap-2">
          <Badge variant="outline" className="flex items-center gap-1 h-7 px-2">
            <MessageSquare className="h-3 w-3" />
            {sectionComments.length}
          </Badge>
        </div>
      )}
    </div>
  );
};
