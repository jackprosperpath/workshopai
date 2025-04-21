
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { v4 as uuidv4 } from "uuid";
import type { Comment } from "../CommentsPanel";

export function useDraftComments(currentDraft: any) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeComment, setActiveComment] = useState<string | null>(null);

  useEffect(() => {
    if (!currentDraft) return;
    const storedComments = localStorage.getItem(`draft-comments-${currentDraft.id}`);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  }, [currentDraft]);

  useEffect(() => {
    if (comments.length > 0 && currentDraft) {
      localStorage.setItem(`draft-comments-${currentDraft.id}`, JSON.stringify(comments));
    }
  }, [comments, currentDraft]);

  const addComment = async (
    sectionIdx: number, 
    text: string, 
    startOffset: number, 
    endOffset: number, 
    selectedText: string
  ) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const newComment: Comment = {
      id: uuidv4(),
      text,
      authorId: data.user.id,
      authorName: data.user.email?.split('@')[0] || "Anonymous",
      timestamp: format(new Date(), "MMM d, yyyy 'at' h:mm a"),
      selection: {
        sectionIndex: sectionIdx,
        startOffset,
        endOffset,
        content: selectedText
      }
    };

    setComments(prev => [...prev, newComment]);
    setActiveComment(newComment.id);
    toast.success("Comment added");
  };

  const onDeleteComment = (id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
    if (activeComment === id) {
      setActiveComment(null);
    }
    toast.success("Comment deleted");
  };

  const onJumpToComment = (comment: Comment) => {
    setActiveComment(comment.id);
  };

  return {
    comments, setComments, activeComment, setActiveComment,
    addComment, onDeleteComment, onJumpToComment
  };
}
