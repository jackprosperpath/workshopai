
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Lightbulb, ChevronLeft, ChevronRight, MessageSquareText } from "lucide-react";

type DiscussionPrompt = {
  id: string;
  question: string;
  answers: string[];
  isAnswered: boolean;
};

type SectionPrompts = {
  [sectionIdx: number]: {
    questions: DiscussionPrompt[];
    isLoading: boolean;
    isVisible: boolean;
  };
};

type DiscussionPanelProps = {
  sectionPrompts: SectionPrompts;
  addAnswer: (sectionIdx: number, promptId: string, answer: string) => void;
  collapsed: boolean;
  setCollapsed: (state: boolean) => void;
};

export const DiscussionPanel: React.FC<DiscussionPanelProps> = ({
  sectionPrompts,
  addAnswer,
  collapsed,
  setCollapsed
}) => {
  // Track which prompt is being answered
  const [active, setActive] = useState<{ sectionIdx: number; promptId: string } | null>(null);
  const [answer, setAnswer] = useState<string>("");

  if (collapsed) {
    return (
      <div className="min-h-full flex flex-col bg-card border-r w-10 items-center justify-center">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} className="m-1">
          <ChevronRight className="w-4 h-4" />
          <span className="sr-only">Open discussion panel</span>
        </Button>
        <Lightbulb className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }

  const allSections = Object.entries(sectionPrompts)
    .filter(([_, s]) => s.questions.length > 0)
    .sort(([a], [b]) => Number(a) - Number(b));

  return (
    <aside className="min-h-full w-80 bg-card border-r shadow-lg flex flex-col z-40 relative">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-base">AI-Facilitated Discussion</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(true)}>
          <ChevronLeft className="w-4 h-4" />
          <span className="sr-only">Collapse discussion panel</span>
        </Button>
      </div>
      <ScrollArea className="px-4 py-2 flex-1">
        <div className="space-y-6">
          {allSections.length === 0 && (
            <div className="py-10 flex justify-center items-center text-muted-foreground text-sm">
              No discussion prompts yet.
            </div>
          )}
          {allSections.map(([sectionIdxStr, { questions, isLoading }]) => (
            <div key={sectionIdxStr} className="mb-4">
              <div className="font-medium text-xs text-primary mb-1 flex items-center gap-1">
                <MessageSquareText className="h-4 w-4" />
                Section {Number(sectionIdxStr) + 1}
              </div>
              {isLoading ? (
                <Badge variant="outline" className="animate-pulse">
                  <Lightbulb className="h-3 w-3" />
                  Loading prompts...
                </Badge>
              ) : (
                <div className="space-y-3">
                  {questions.map((prompt) => (
                    <div
                      key={prompt.id}
                      className={`p-2 rounded-md border ${prompt.isAnswered ? "bg-muted/40 border-muted-foreground/20" : "bg-card"} space-y-2`}
                    >
                      <div className="flex gap-2 justify-between items-center">
                        <span className="text-sm">{prompt.question}</span>
                        {prompt.isAnswered && (
                          <Badge variant="outline" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Answered
                          </Badge>
                        )}
                      </div>
                      {prompt.answers.length > 0 && (
                        <div className="pl-2 border-l border-muted space-y-1">
                          {prompt.answers.map((ans, i) => (
                            <p key={i} className="text-sm text-muted-foreground">{ans}</p>
                          ))}
                        </div>
                      )}
                      {!prompt.isAnswered && (
                        <div>
                          {active && active.sectionIdx === Number(sectionIdxStr) && active.promptId === prompt.id ? (
                            <div className="pt-1 space-y-2">
                              <Textarea
                                placeholder="Type your answer..."
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                className="min-h-[60px] text-sm"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm"
                                  onClick={() => { setActive(null); setAnswer(""); }}>
                                  Cancel
                                </Button>
                                <Button size="sm" disabled={!answer.trim()}
                                  onClick={() => {
                                    addAnswer(Number(sectionIdxStr), prompt.id, answer);
                                    setActive(null);
                                    setAnswer("");
                                  }}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                              onClick={() =>
                                setActive({ sectionIdx: Number(sectionIdxStr), promptId: prompt.id })
                              }
                            >
                              Answer
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};
