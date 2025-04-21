
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, X } from "lucide-react";

export type Comment = {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  timestamp: string;
  selection: {
    sectionIndex: number;
    startOffset: number;
    endOffset: number;
    content: string;
  };
};

interface CommentsPanelProps {
  comments: Comment[];
  activeComment: string | null;
  setActiveComment: (id: string | null) => void;
  onDeleteComment: (id: string) => void;
  onJumpToComment: (comment: Comment) => void;
}

export function CommentsPanel({
  comments,
  activeComment,
  setActiveComment,
  onDeleteComment,
  onJumpToComment,
}: CommentsPanelProps) {
  if (comments.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <h3 className="font-medium">No comments yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select text in the document and click the comment button to add feedback
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {comments.map((comment) => (
          <div 
            key={comment.id}
            className={`rounded-lg border p-3 ${
              activeComment === comment.id ? "bg-accent" : ""
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-xs font-medium">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{comment.authorName}</div>
                  <div className="text-xs text-muted-foreground">{comment.timestamp}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onDeleteComment(comment.id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Delete comment</span>
              </Button>
            </div>
            
            {comment.selection.content && (
              <div className="bg-muted px-2 py-1 rounded text-xs italic mb-2 cursor-pointer" onClick={() => onJumpToComment(comment)}>
                "{comment.selection.content.length > 60 
                  ? comment.selection.content.substring(0, 60) + "..." 
                  : comment.selection.content}"
              </div>
            )}
            
            <div className="text-sm whitespace-pre-wrap">{comment.text}</div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
