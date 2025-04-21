
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquareText, Lightbulb, ChevronDown, ChevronUp, Check } from "lucide-react";

type DiscussionPrompt = {
  id: string;
  question: string;
  answers: string[];
  isAnswered: boolean;
};

type DiscussionPromptsProps = {
  sectionIdx: number;
  prompts: {
    questions: DiscussionPrompt[];
    isLoading: boolean;
    isVisible: boolean;
  };
  onToggleVisibility: () => void;
  onAddAnswer: (promptId: string, answer: string) => void;
};

export const DiscussionPrompts: React.FC<DiscussionPromptsProps> = ({
  sectionIdx,
  prompts,
  onToggleVisibility,
  onAddAnswer
}) => {
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  
  const handleSaveAnswer = (promptId: string) => {
    if (!answer.trim()) return;
    onAddAnswer(promptId, answer);
    setAnswer("");
    setActivePromptId(null);
  };
  
  if (prompts.isLoading) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline" className="flex items-center gap-1 h-7 px-2 animate-pulse">
          <Lightbulb className="h-3 w-3" />
          Loading prompts...
        </Badge>
      </div>
    );
  }
  
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 h-7 px-2"
            >
              <Lightbulb className="h-3 w-3" />
              Discussion prompts
              <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                {prompts.questions.length}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Discussion prompts</h4>
              <p className="text-xs text-muted-foreground">
                Use these prompts to facilitate discussion around this section of the solution.
              </p>
              <ScrollArea className="h-[200px] mt-2">
                <div className="space-y-3">
                  {prompts.questions.map((prompt) => (
                    <div 
                      key={prompt.id} 
                      className={`p-2 rounded-md border ${prompt.isAnswered ? 'bg-muted/40 border-muted-foreground/20' : 'bg-card'}`}
                    >
                      <p className="text-sm">{prompt.question}</p>
                      {prompt.isAnswered && (
                        <Badge variant="outline" className="mt-1">
                          <Check className="h-3 w-3 mr-1" />
                          Answered
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button 
                size="sm" 
                className="w-full mt-2" 
                onClick={onToggleVisibility}
              >
                {prompts.isVisible ? 'Hide in document' : 'Show in document'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {prompts.isVisible && (
        <div className="mt-3 space-y-3 pl-3 border-l-2 border-primary/20">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <MessageSquareText className="h-4 w-4" /> 
              Discussion prompts
            </h4>
            <Button variant="ghost" size="sm" onClick={onToggleVisibility} className="h-6 w-6 p-0">
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {prompts.questions.map((prompt) => (
              <div key={prompt.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{prompt.question}</p>
                  {prompt.isAnswered ? (
                    <Badge variant="outline" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Answered
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-6"
                      onClick={() => setActivePromptId(activePromptId === prompt.id ? null : prompt.id)}
                    >
                      Answer
                    </Button>
                  )}
                </div>
                
                {prompt.answers.length > 0 && (
                  <div className="pl-3 border-l border-muted space-y-1">
                    {prompt.answers.map((ans, i) => (
                      <p key={i} className="text-sm text-muted-foreground">{ans}</p>
                    ))}
                  </div>
                )}
                
                {activePromptId === prompt.id && (
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Type your answer..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setActivePromptId(null);
                          setAnswer("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleSaveAnswer(prompt.id)}
                        disabled={!answer.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
