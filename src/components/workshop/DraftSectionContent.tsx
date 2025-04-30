
import React from "react";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { Comment } from "./CommentsPanel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DraftSectionContentProps {
  para: string;
  idx: number;
  editingSection: number | null;
  isUserEditingSection: (sectionIdx: number) => boolean;
  highlightChanges: (text: string, idx: number) => React.ReactNode; // will not be used now
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
  // highlightChanges,
  comments,
  activeComment,
  setActiveComment,
  sectionRef,
  onEditStart,
}) => {
  const sectionComments = comments.filter(comment => comment.selection.sectionIndex === idx);

  // We will render para as markdown rich text with highlights for comment selections as before (but now inside ReactMarkdown).
  // Because ReactMarkdown does not support direct partial text highlighting, we use a trick:
  // We split para into parts according to comments and wrap highlighted spans similarly to the previous approach.
  // Then we render each part as its own ReactMarkdown.

  if (editingSection === idx || sectionComments.length === 0) {
    // Render entire para as markdown with no comment highlights.
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
        <div className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {para}
          </ReactMarkdown>
        </div>

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
  }

  // Else render with highlights inside

  // Sort comments by startOffset ascending
  const sortedComments = [...sectionComments].sort((a, b) => a.selection.startOffset - b.selection.startOffset);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedComments.forEach((comment, i) => {
    const { startOffset, endOffset } = comment.selection;

    if (startOffset > lastIndex) {
      // Non-highlighted text
      const nonHighlightText = para.substring(lastIndex, startOffset);
      parts.push(
        <div key={`nonhighlight-${i}-${lastIndex}`} className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {nonHighlightText}
          </ReactMarkdown>
        </div>
      );
    }

    const highlightedText = para.substring(startOffset, endOffset);
    const isActive = activeComment === comment.id;

    parts.push(
      <span
        key={`highlight-${comment.id}`}
        className={`relative cursor-pointer ${isActive ? 'bg-yellow-200' : 'bg-yellow-100'}`}
        onClick={(e) => {
          e.stopPropagation();
          setActiveComment(comment.id);
        }}
      >
        <div className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {highlightedText}
          </ReactMarkdown>
        </div>
      </span>
    );

    lastIndex = endOffset;
  });

  if (lastIndex < para.length) {
    const remainingText = para.substring(lastIndex);
    parts.push(
      <div key={`nonhighlight-end`} className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {remainingText}
        </ReactMarkdown>
      </div>
    );
  }

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
      {parts}

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
