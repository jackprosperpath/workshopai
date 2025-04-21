
import React from "react";
import { Button } from "@/components/ui/button";

interface InlineCommentInputProps {
  commentText: string;
  onCommentTextChange: (v: string) => void;
  onCancel: () => void;
  onAdd: () => void;
  commentInputRef: React.RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
}

export const InlineCommentInput: React.FC<InlineCommentInputProps> = ({
  commentText,
  onCommentTextChange,
  onCancel,
  onAdd,
  commentInputRef,
  disabled
}) => (
  <div className="bg-white shadow-lg rounded-lg border p-2 w-64">
    <textarea
      ref={commentInputRef}
      value={commentText}
      onChange={(e) => onCommentTextChange(e.target.value)}
      className="w-full border rounded-md p-2 text-sm mb-2 min-h-[80px]"
      placeholder="Add your comment..."
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
        else if (e.key === 'Enter' && e.ctrlKey) onAdd();
      }}
    />
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="sm" onClick={onAdd} disabled={disabled || !commentText.trim()}>
        Comment
      </Button>
    </div>
    <div className="text-xs text-muted-foreground mt-1">
      Tip: Press Ctrl+Enter to submit
    </div>
  </div>
);
