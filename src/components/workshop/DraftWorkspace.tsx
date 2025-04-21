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
import { useDocumentDiscussionPrompts } from "@/hooks/useDocumentDiscussionPrompts";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useDraftPresence } from "./hooks/useDraftPresence";
import { useDraftComments } from "./hooks/useDraftComments";
import { DraftWorkspaceHeader } from "./DraftWorkspaceHeader";
import { DraftMainContent } from "./DraftMainContent";

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
  const [editingDraft, setEditingDraft] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false);

  const { activeUsers, editingSessions } = useDraftPresence(currentDraft);
  const {
    comments, setComments, activeComment, setActiveComment,
    addComment, onDeleteComment, onJumpToComment
  } = useDraftComments(currentDraft);

  const { 
    sectionPrompts,
    generatePrompts,
    togglePromptsVisibility,
    addAnswer,
    getPromptAnswers
  } = useDiscussionPrompts(workshopId);

  const {
    prompts: documentPrompts,
    isLoading: isLoadingDocPrompts,
    generatePrompts: generateDocPrompts,
    addAnswer: addDocAnswer
  } = useDocumentDiscussionPrompts(workshopId);

  useEffect(() => {
    if (currentDraft && currentDraft.output && currentDraft.output.length > 0) {
      const fullText = currentDraft.output.join('\n\n');
      generateDocPrompts(fullText);
    }
  }, [currentDraft?.id]);

  useEffect(() => {
    if (editingSection !== null && editTextareaRef.current) {
      editTextareaRef.current.focus();
    }
  }, [editingSection]);

  const [isSaving, setIsSaving] = useState(false);
  const [activeUsersOld, setActiveUsersOld] = useState<{ id: string; name: string; section: number | null; content?: string }[]>([]);
  const [showDiffView, setShowDiffView] = useState(false);
  const [diffVersions, setDiffVersions] = useState<{ old: number; new: number }>({ old: 0, new: 0 });
  const [editingSessionsOld, setEditingSessionsOld] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!currentDraft) return;
    
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
          setActiveUsersOld(currentUsers);
          const sessions: { [key: string]: string } = {};
          currentUsers.forEach((user: any) => {
            if (user.editing_section !== null && user.content) {
              sessions[`${user.editing_section}`] = user.content;
            }
          });
          setEditingSessionsOld(sessions);
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          const newUser = newPresences[0];
          toast.info(`${newUser.email} joined the session`);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          const leftUser = leftPresences[0];
          toast.info(`${leftUser.email} left the session`);
          setActiveUsersOld((prev) => prev.filter((user) => user.id !== leftUser.user_id));
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

  const addCommentOld = async (
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

  const handleDeleteCommentOld = (id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
    if (activeComment === id) {
      setActiveComment(null);
    }
    toast.success("Comment deleted");
  };

  const handleJumpToCommentOld = (comment: Comment) => {
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

  const aiDiscussionComments = [
    ...Object.entries(sectionPrompts).flatMap(([sectionIdxStr, section]) => {
      if (!section || !section.questions) return [];
      const idx = parseInt(sectionIdxStr, 10);
      return section.questions
        .filter((q) => q.answers.length > 0)
        .map((q) => ({
          id: `ai-discussion-${q.id}`,
          text: q.answers.map((a, i) => `A${q.answers.length > 1 ? `${i + 1}` : ""}: ${a}`).join("\n"),
          authorId: "ai-system",
          authorName: "Discussion AI",
          timestamp: "",
          selection: {
            sectionIndex: idx,
            startOffset: 0,
            endOffset: 0,
            content: q.question,
          },
          isSystem: true,
          question: q.question
        }));
    }),
    ...documentPrompts.filter(p => p.answers.length > 0).map((p) => ({
      id: `doc-discussion-${p.id}`,
      text: p.answers.map((a, i) => `A${p.answers.length > 1 ? `${i + 1}` : ""}: ${a}`).join("\n"),
      authorId: "ai-system",
      authorName: "Document Discussion",
      timestamp: "",
      selection: {
        sectionIndex: -1,
        startOffset: 0,
        endOffset: 0,
        content: p.question,
      },
      isSystem: true,
      question: p.question
    }))
  ];

  const allComments = [
    ...aiDiscussionComments,
    ...comments,
  ];

  const discussionPrompts = {
    questions: documentPrompts.map(p => ({
      id: p.id,
      question: p.question,
      answers: p.answers,
      isAnswered: p.isAnswered
    })),
    isLoading: isLoadingDocPrompts
  };

  return (
    <section className="h-full">
      <DraftWorkspaceHeader
        currentDraft={currentDraft}
        versions={versions}
        currentIdx={currentIdx}
        setCurrentIdx={setCurrentIdx}
        activeUsers={activeUsers}
        onCompare={handleCompareDrafts}
        comments={comments}
        showCommentsSidebar={showCommentsSidebar}
        setShowCommentsSidebar={setShowCommentsSidebar}
        editingDraft={editingDraft}
        handleStartEditingDraft={() => setEditingDraft(true)}
        handleCancelEditingDraft={() => {
          setEditingDraft(false);
          setEditingSection(null);
          setEditableContent("");
          updateEditingSection(null);
        }}
      />
      <div className="flex h-[calc(100vh-15rem)] overflow-hidden">
        <div className={`flex-1 overflow-auto transition-all duration-200 ${showCommentsSidebar ? 'w-3/4' : 'w-full'}`}>
          <DraftMainContent
            currentDraft={currentDraft}
            editingDraft={editingDraft}
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
            sectionPrompts={sectionPrompts}
            generatePrompts={generatePrompts}
            togglePromptsVisibility={togglePromptsVisibility}
            addAnswer={addAnswer}
            onRePrompt={onRePrompt}
            loading={loading}
            currentIdx={currentIdx}
            versions={versions}
            handleSubmitPromptFeedback={handleSubmitPromptFeedback}
            setCurrentIdx={setCurrentIdx}
          />
        </div>
        {showCommentsSidebar && (
          <div className="w-1/4 border-l h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-medium">Comments & Discussion</h3>
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
            <div className="flex-1 overflow-hidden">
              <CommentsPanel
                comments={allComments}
                activeComment={activeComment}
                setActiveComment={setActiveComment}
                onDeleteComment={onDeleteComment}
                onJumpToComment={onJumpToComment}
                discussionPrompts={discussionPrompts}
                onAddPromptAnswer={addDocAnswer}
              />
            </div>
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
