import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { DraftVersion } from "@/hooks/useDraftWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import DraftSection from "./DraftSection";
import ActiveUsersAvatars from "./ActiveUsersAvatars";
import DraftVersionSelector from "./DraftVersionSelector";
import { DiffViewer } from "./DiffViewer";

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
}) {
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editableContent, setEditableContent] = useState<string>("");
  const [editingSessions, setEditingSessions] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeUsers, setActiveUsers] = useState<{ id: string; name: string; section: number | null }[]>([]);
  const [showDiffView, setShowDiffView] = useState(false);
  const [diffVersions, setDiffVersions] = useState<{ old: number; new: number }>({ old: 0, new: 0 });
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingSection !== null && editTextareaRef.current) {
      editTextareaRef.current.focus();
    }
  }, [editingSection]);

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

  const handleEditStart = (idx: number, content: string) => {
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
      const updatedVersions = versions.map((version, i) => {
        if (i === currentIdx) {
          const newOutput = [...version.output];
          newOutput[idx] = editableContent;
          return { ...version, output: newOutput };
        }
        return version;
      });
      setCurrentIdx(currentIdx || 0);
      setEditingSection(null);
      updateEditingSection(null);
      toast.success("Changes saved");
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
    <section className="border rounded p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Draft v{currentDraft.id}</h2>
        <div className="flex items-center gap-2">
          <ActiveUsersAvatars activeUsers={activeUsers} />
          <DraftVersionSelector
            versions={versions}
            currentDraftId={currentDraft.id}
            onSelect={setCurrentIdx}
            onCompare={handleCompareDrafts}
          />
        </div>
      </div>

      {currentDraft.output.map((para, idx) => (
        <DraftSection
          key={`section-${idx}`}
          idx={idx}
          para={para}
          currentDraftId={currentDraft.id}
          editable={editingSection === idx}
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
          addFeedback={addFeedback}
          activeThread={activeThread}
          setActiveThread={setActiveThread}
          sectionFeedback={currentDraft.sectionFeedback[idx] || []}
        />
      ))}

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
