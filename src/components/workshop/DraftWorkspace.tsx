import React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare } from "lucide-react";
import type { DraftVersion } from "@/hooks/useDraftWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import DraftSection from "./DraftSection";
import ActiveUsersAvatars from "./ActiveUsersAvatars";
import DraftVersionSelector from "./DraftVersionSelector";
import { DiffViewer } from "./DiffViewer";
import { Comment, CommentsPanel } from "./CommentsPanel";
import { useDiscussionPrompts } from "@/hooks/useDiscussionPrompts";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

export function DraftWorkspace({
  currentDraft,
  versions,
  currentIdx,
  setCurrentIdx,
  activeThread,
  setActiveThread,
  addFeedback,
  onRePrompt,
  loading,
  workshopId,
  updateDraftSection,
}: {
  currentDraft: DraftVersion | null;
  versions: DraftVersion[];
  currentIdx: number | null;
  setCurrentIdx: (idx: number) => void;
  activeThread: number | null;
  setActiveThread: (idx: number | null) => void;
  addFeedback: (sectionIdx: number, text: string) => void;
  onRePrompt: () => void;
  loading: boolean;
  workshopId: string | null;
  updateDraftSection: (draftId: number, sectionIdx: number, content: string) => Promise<boolean | undefined>;
}) {
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editableContent, setEditableContent] = useState<string>("");
  const [editingSessions, setEditingSessions] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeUsers, setActiveUsers] = useState<{ id: string; name: string; section: number | null; content?: string }[]>([]);
  const [showDiffView, setShowDiffView] = useState(false);
  const [diffVersions, setDiffVersions] = useState<{ old: number; new: number }>({ old: 0, new: 0 });
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState(false);

  const { 
    sectionPrompts,
    generatePrompts,
    togglePromptsVisibility,
    addAnswer,
    getPromptAnswers
  } = useDiscussionPrompts(workshopId);

  useEffect(() => {
    if (editingSection !== null && editTextareaRef.current) {
      editTextareaRef.current.focus();
    }
  }, [editingSection]);

  useEffect(() => {
    if (!currentDraft) return;
    
    const loadComments = () => {
      const storedComments = localStorage.getItem(`draft-comments-${currentDraft.id}`);
      if (storedComments) {
        setComments(JSON.parse(storedComments));
      }
    };
    
    loadComments();
    
    const getUserInfo = async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    };
    
    const setupPresence = async () => {
      const user = await getUserInfo();
      if (!user) return;
      const userId = user.id;
      const userEmail = user.email || "Anonymous";
      const channel = supabase.channel(`draft-${currentDraft.id}`);
      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const currentUsers = Object.values(state)
            .flat()
            .map((user: any) => ({
              id: user.user_id,
              name: user.email,
              section: user.editing_section,
              content: user.content
            }));
          setActiveUsers(currentUsers);
          const sessions: { [key: string]: string } = {};
          currentUsers.forEach((user: any) => {
            if (user.editing_section !== null && user.content) {
              sessions[`${user.editing_section}`] = user.content;
            }
          });
          setEditingSessions(sessions);
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          const newUser = newPresences[0];
          toast.info(`${newUser.email} joined the session`);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          const leftUser = leftPresences[0];
          toast.info(`${leftUser.email} left the session`);
          setActiveUsers((prev) => prev.filter((user) => user.id !== leftUser.user_id));
        })
        .subscribe(async (status) => {
          if (status !== "SUBSCRIBED") return;
          await channel.track({
            user_id: userId,
            email: userEmail.substring(0, userEmail.indexOf("@")) || userEmail,
            editing_section: null,
            online_at: new Date().toISOString(),
          });
        });
      return () => {
        supabase.removeChannel(channel);
      };
    };
    const cleanup = setupPresence();
    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, [currentDraft]);

  useEffect(() => {
    if (comments.length > 0 && currentDraft) {
      localStorage.setItem(`draft-comments-${currentDraft.id}`, JSON.stringify(comments));
    }
  }, [comments, currentDraft]);

  const handleEditStart = (idx: number, content: string) => {
    if (!editingDraft) return;
    setEditingSection(idx);
    setEditableContent(content);
    updateEditingSection(idx);
  };

  const updateEditingSection = async (sectionIdx: number | null, content?: string) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const userId = data.user.id;
    const userEmail = data.user.email || "Anonymous";
    const channel = supabase.channel(`draft-${currentDraft?.id}`);
    await channel.track({
      user_id: userId,
      email: userEmail.substring(0, userEmail.indexOf("@")) || userEmail,
      editing_section: sectionIdx,
      content: content || null,
      online_at: new Date().toISOString(),
    });
  };

  const handleEditCancel = () => {
    setEditingSection(null);
    setEditableContent("");
    updateEditingSection(null);
  };

  const handleEditSave = async (idx: number) => {
    if (!currentDraft) return;
    setIsSaving(true);
    try {
      if (currentIdx !== null) {
        const success = await updateDraftSection(currentDraft.id, idx, editableContent);
        if (success) {
          setEditingSection(null);
          updateEditingSection(null);
          toast.success("Changes saved");
        } else {
          throw new Error("Failed to save changes");
        }
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
    if (editingSection !== null) {
      updateEditingSection(editingSection, e.target.value);
    }
  };

  const handleCompareDrafts = (oldIdx: number, newIdx: number) => {
    if (oldIdx >= 0 && newIdx >= 0 && oldIdx < versions.length && newIdx < versions.length) {
      setDiffVersions({
        old: versions[oldIdx].id,
        new: versions[newIdx].id
      });
      setShowDiffView(true);
    }
  };

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
    setShowCommentsSidebar(true);
    toast.success("Comment added");
  };

  const handleDeleteComment = (id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
    if (activeComment === id) {
      setActiveComment(null);
    }
    toast.success("Comment deleted");
  };

  const handleJumpToComment = (comment: Comment) => {
    setActiveComment(comment.id);
    // If needed, we could add scrolling to the specific section/comment here
  };

  async function improveSection(
    type: "redraft" | "add_detail" | "simplify",
    idx: number,
    para: string
  ): Promise<{ newText?: string; reasoning?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('improve-section', {
        body: {
          action: type,
          section: para,
        }
      });
      if (error) {
        throw error;
      }
      return {
        newText: data?.newText || "",
        reasoning: data?.reasoning || ""
      };
    } catch (e) {
      return {};
    }
  }

  const handleUpdateSection = async (sectionIdx: number, content: string) => {
    if (!currentDraft) return false;
    
    try {
      const success = await updateDraftSection(currentDraft.id, sectionIdx, content);
      if (success) {
        toast.success("AI improvements applied");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Failed to apply AI improvements");
      return false;
    }
  };

  const handleStartEditingDraft = () => {
    setEditingDraft(true);
  };

  const handleCancelEditingDraft = () => {
    setEditingDraft(false);
    setEditingSection(null);
    setEditableContent("");
    updateEditingSection(null);
  };

  const handleSubmitPromptFeedback = async (sectionIdx: number) => {
    if (!currentDraft) return;
    
    const promptAnswers = getPromptAnswers(sectionIdx);
    if (promptAnswers.length === 0) return;
    
    const feedbackText = promptAnswers.map(pa => 
      `Q: ${pa.question}\n${pa.answers.map(a => `A: ${a}`).join('\n')}`
    ).join('\n\n');
    
    addFeedback(sectionIdx, feedbackText);
    toast.success("Discussion points added as feedback");
  };

  if (!currentDraft) {
    return (
      <section className="border rounded p-8 flex flex-col items-center justify-center text-center space-y-4">
        <h3 className="text-xl font-medium">No solution draft available</h3>
        <p className="text-muted-foreground">
          Define your problem and requirements in the Topic tab, then generate a solution.
        </p>
        <Button className="mt-4" onClick={onRePrompt} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Generating…" : "Generate Solution"}
        </Button>
      </section>
    );
  }

  const highlightChanges = (text: string, idx: number) => {
    if (currentIdx === null || currentIdx === 0) return text;
    const prev = versions[currentIdx - 1];
    return prev.output[idx] !== text ? (
      <span className="bg-yellow-200">{text}</span>
    ) : (
      text
    );
  };

  const isUserEditingSection = (sectionIdx: number) => {
    return activeUsers.some((user) => user.section === sectionIdx);
  };

  const getEditingUserForSection = (sectionIdx: number) => {
    return activeUsers.find((user) => user.section === sectionIdx);
  };

  const getOldContent = () => {
    const oldVersionIdx = versions.findIndex(v => v.id === diffVersions.old);
    return oldVersionIdx >= 0 ? versions[oldVersionIdx].output : [];
  };

  const getNewContent = () => {
    const newVersionIdx = versions.findIndex(v => v.id === diffVersions.new);
    return newVersionIdx >= 0 ? versions[newVersionIdx].output : [];
  };

  return (
    <section>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold">Draft v{currentDraft.id}</h2>
        <div className="flex items-center gap-2">
          <ActiveUsersAvatars activeUsers={activeUsers} />
          <DraftVersionSelector
            versions={versions}
            currentDraftId={currentDraft.id}
            onSelect={setCurrentIdx}
            onCompare={handleCompareDrafts}
          />
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowCommentsSidebar(!showCommentsSidebar)}
          >
            <MessageSquare className="h-4 w-4" />
            Comments
            {comments.length > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {comments.length}
              </span>
            )}
          </Button>
          {!editingDraft ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEditingDraft}
            >
              Edit Draft
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEditingDraft}
            >
              Exit Edit Mode
            </Button>
          )}
        </div>
      </div>

      <div className="flex">
        <Card className={`flex-1 p-6 m-4 bg-card rounded-xl shadow-sm min-h-[300px] transition-all duration-200`}>
          {currentDraft?.output.map((para, idx) => (
            <DraftSection
              key={`section-${idx}`}
              idx={idx}
              para={para}
              currentDraftId={currentDraft.id}
              editable={editingDraft && editingSection === idx}
              editingSection={editingSection}
              editingSessions={editingSessions}
              setEditableContent={setEditableContent}
              editableContent={editableContent}
              editTextareaRef={editTextareaRef}
              onEditStart={handleEditStart}
              onEditCancel={handleEditCancel}
              onEditSave={handleEditSave}
              onContentChange={handleContentChange}
              isSaving={isSaving}
              isUserEditingSection={isUserEditingSection}
              getEditingUserForSection={getEditingUserForSection}
              highlightChanges={highlightChanges}
              activeComment={activeComment}
              setActiveComment={setActiveComment}
              comments={comments}
              addComment={addComment}
              improveSection={improveSection}
              updateDraftSection={handleUpdateSection}
              discussionPrompts={sectionPrompts[idx]}
              onGeneratePrompts={generatePrompts}
              onTogglePrompts={togglePromptsVisibility}
              onAddPromptAnswer={addAnswer}
            />
          ))}
          
          {Object.entries(sectionPrompts).some(([_, prompts]) => 
            prompts.questions.some(q => q.isAnswered)
          ) && (
            <div className="mt-4 p-3 border rounded-md bg-muted/20">
              <h4 className="font-medium text-sm mb-2">Discussion answers</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Submit discussion answers as feedback to improve the next draft generation.
              </p>
              <div className="space-y-2">
                {Object.entries(sectionPrompts).map(([sectionIdxStr, prompts]) => {
                  const sectionIdx = parseInt(sectionIdxStr);
                  const answeredCount = prompts.questions.filter(q => q.isAnswered).length;
                  
                  if (answeredCount === 0) return null;
                  
                  return (
                    <div key={sectionIdxStr} className="flex justify-between items-center">
                      <span className="text-sm">
                        Section {sectionIdx + 1}: {answeredCount} answered
                      </span>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleSubmitPromptFeedback(sectionIdx)}
                      >
                        Submit as feedback
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={onRePrompt}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Generating…" : "Re‑prompt"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (currentDraft) {
                  const finalVersion = {
                    ...currentDraft,
                    isFinal: true,
                  };
                  const updatedVersions = versions.map((v, i) =>
                    i === currentIdx ? finalVersion : v
                  );
                  setCurrentIdx(currentIdx || 0);
                  window.location.hash = "endorsement";
                }
              }}
            >
              Finalise
            </Button>
          </div>
        </Card>
        
        {showCommentsSidebar && (
          <div className="w-1/4 border-l h-[calc(100vh-15rem)] overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-medium">Comments</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={() => setShowCommentsSidebar(false)}
              >
                <span className="sr-only">Close</span>
                <span>×</span>
              </Button>
            </div>
            <CommentsPanel
              comments={comments}
              activeComment={activeComment}
              setActiveComment={setActiveComment}
              onDeleteComment={handleDeleteComment}
              onJumpToComment={handleJumpToComment}
            />
          </div>
        )}
      </div>

      <DiffViewer
        open={showDiffView}
        onOpenChange={setShowDiffView}
        oldContent={getOldContent()}
        newContent={getNewContent()}
        versionNumbers={diffVersions}
      />
    </section>
  );
}

export default DraftWorkspace;
