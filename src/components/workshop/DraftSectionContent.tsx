
import React from "react";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Lightbulb } from "lucide-react";
import { Comment } from "./CommentsPanel";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

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
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});

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

  // Handle prompt answers
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
        
        {hasDiscussionPrompts && (
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 h-7 px-2 bg-primary/10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (onTogglePrompts) onTogglePrompts();
            }}
          >
            <Lightbulb className="h-3 w-3" />
            {answeredPromptsCount > 0 ? `${answeredPromptsCount} answered` : "Discuss"}
          </Badge>
        )}
      </div>
      
      {/* Discussion prompts section */}
      {hasDiscussionPrompts && discussionPrompts.isVisible && (
        <div 
          className="mt-3 border rounded-md p-3 bg-muted/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-sm font-medium mb-2 flex justify-between items-center">
            <span>Discussion Points</span>
            {discussionPrompts.isLoading && <span className="text-xs italic">Loading...</span>}
          </div>
          
          <div className="space-y-3">
            {discussionPrompts.questions.map((question, qIdx) => (
              <Collapsible key={question.id} className="border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <CollapsibleTrigger className="text-left font-medium text-sm hover:text-primary transition-colors">
                    {question.question}
                  </CollapsibleTrigger>
                  {question.isAnswered && (
                    <Badge variant="outline" size="sm" className="text-xs bg-green-50">
                      Answered
                    </Badge>
                  )}
                </div>
                
                <CollapsibleContent className="pt-2">
                  {question.answers.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {question.answers.map((answer: string, aIdx: number) => (
                        <div key={aIdx} className="bg-background p-2 rounded text-sm">
                          {answer}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-2">
                    <Textarea
                      placeholder="Add your thoughts..."
                      className="text-sm min-h-[60px]"
                      value={promptAnswers[question.id] || ''}
                      onChange={(e) => handlePromptAnswerChange(question.id, e.target.value)}
                    />
                    <Button 
                      size="sm" 
                      className="self-end"
                      disabled={!promptAnswers[question.id]?.trim()}
                      onClick={() => handleSubmitAnswer(question.id)}
                    >
                      Submit
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
