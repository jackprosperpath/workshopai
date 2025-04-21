
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, X, MessageSquare, Lightbulb } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
  isSystem?: boolean;
  question?: string;
};

interface CommentsPanelProps {
  comments: Comment[];
  activeComment: string | null;
  setActiveComment: (id: string | null) => void;
  onDeleteComment: (id: string) => void;
  onJumpToComment: (comment: Comment) => void;
  discussionPrompts?: {
    questions: {
      id: string;
      question: string;
      answers: string[];
      isAnswered: boolean;
    }[];
    isLoading: boolean;
  };
  onAddPromptAnswer?: (promptId: string, answer: string) => void;
}

export function CommentsPanel({
  comments,
  activeComment,
  setActiveComment,
  onDeleteComment,
  onJumpToComment,
  discussionPrompts,
  onAddPromptAnswer,
}: CommentsPanelProps) {
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});
  const userComments = comments.filter(comment => !comment.isSystem);
  const aiDiscussionComments = comments.filter(comment => comment.isSystem);

  const handlePromptAnswerChange = (promptId: string, value: string) => {
    setPromptAnswers(prev => ({
      ...prev,
      [promptId]: value
    }));
  };

  const handleSubmitAnswer = (promptId: string) => {
    if (onAddPromptAnswer && promptAnswers[promptId]?.trim()) {
      onAddPromptAnswer(promptId, promptAnswers[promptId].trim());
      setPromptAnswers(prev => ({
        ...prev,
        [promptId]: ''
      }));
    }
  };

  const noContentToShow = 
    comments.length === 0 && 
    (!discussionPrompts || discussionPrompts.questions.length === 0);

  if (noContentToShow) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <h3 className="font-medium">No comments or discussion points yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select text in the document and click the comment button to add feedback
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* AI Discussion Prompts */}
        {discussionPrompts && discussionPrompts.questions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium">Document Discussion Points</h4>
            </div>
            
            {discussionPrompts.isLoading ? (
              <div className="p-3 border rounded animate-pulse bg-muted/30">
                Loading discussion points...
              </div>
            ) : (
              <div className="space-y-3">
                {discussionPrompts.questions.map((prompt) => (
                  <div 
                    key={prompt.id}
                    className={`rounded-lg border p-3 ${
                      activeComment === prompt.id ? "bg-accent" : "bg-muted/30"
                    }`}
                  >
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-xs font-medium">
                            AI
                          </div>
                        </Avatar>
                        <div className="text-sm font-medium">AI Facilitator</div>
                      </div>
                      <div className="text-sm font-medium">{prompt.question}</div>
                    </div>
                    
                    {prompt.answers.length > 0 && (
                      <div className="mb-2 space-y-1 pl-2 border-l border-muted">
                        {prompt.answers.map((answer, aIdx) => (
                          <div key={aIdx} className="text-sm text-muted-foreground bg-background/50 p-1 rounded">
                            {answer}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!prompt.isAnswered && onAddPromptAnswer && (
                      <div className="flex gap-2 mt-2">
                        <Textarea
                          placeholder="Add your thoughts..."
                          className="text-sm min-h-[60px]"
                          value={promptAnswers[prompt.id] || ''}
                          onChange={(e) => handlePromptAnswerChange(prompt.id, e.target.value)}
                        />
                        <Button 
                          size="sm" 
                          className="self-end"
                          disabled={!promptAnswers[prompt.id]?.trim()}
                          onClick={() => handleSubmitAnswer(prompt.id)}
                        >
                          Submit
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {(userComments.length > 0 || aiDiscussionComments.length > 0) && <Separator className="my-4" />}
          </div>
        )}

        {/* AI Discussion Comments (section-level) */}
        {aiDiscussionComments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium">AI Discussion Points</h4>
            </div>
            {aiDiscussionComments.map((comment) => (
              <div 
                key={comment.id}
                className={`rounded-lg border p-3 mb-2 ${
                  activeComment === comment.id ? "bg-accent" : "bg-muted/30"
                }`}
                onClick={() => setActiveComment(comment.id !== activeComment ? comment.id : null)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-xs font-medium">
                        AI
                      </div>
                    </Avatar>
                    <div className="text-sm font-medium">{comment.authorName}</div>
                  </div>
                </div>
                
                <div className="bg-background px-2 py-1 rounded text-sm mb-2 cursor-pointer" onClick={() => onJumpToComment(comment)}>
                  <span className="font-medium">Q:</span> {comment.selection.content}
                </div>
                
                <div className="text-sm whitespace-pre-wrap">{comment.text}</div>
              </div>
            ))}
            {userComments.length > 0 && <Separator className="my-4" />}
          </div>
        )}

        {/* User Comments */}
        {userComments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium">User Comments</h4>
            </div>
            {userComments.map((comment) => (
              <div 
                key={comment.id}
                className={`rounded-lg border p-3 mb-2 ${
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
        )}
      </div>
    </ScrollArea>
  );
}
