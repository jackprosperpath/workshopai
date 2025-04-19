import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { DraftVersion } from "@/hooks/useDraftWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type DraftWorkspaceProps = {
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
};

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
}: DraftWorkspaceProps) {
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editableContent, setEditableContent] = useState<string>("");
  const [editingSessions, setEditingSessions] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeUsers, setActiveUsers] = useState<{id: string, name: string, section: number | null}[]>([]);
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
      const userEmail = user.email || 'Anonymous';
      const initials = userEmail.substring(0, 2).toUpperCase();
      
      const channel = supabase.channel(`draft-${currentDraft.id}`);
      
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const currentUsers = Object.values(state).flat().map((user: any) => ({
            id: user.user_id,
            name: user.email,
            section: user.editing_section
          }));
          setActiveUsers(currentUsers);
          
          const sessions: {[key: string]: string} = {};
          currentUsers.forEach((user: any) => {
            if (user.editing_section !== null && user.content) {
              sessions[`${user.editing_section}`] = user.content;
            }
          });
          setEditingSessions(sessions);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          const newUser = newPresences[0];
          toast.info(`${newUser.email} joined the session`);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          const leftUser = leftPresences[0];
          toast.info(`${leftUser.email} left the session`);
          
          setActiveUsers(prev => prev.filter(user => user.id !== leftUser.user_id));
        })
        .subscribe(async (status) => {
          if (status !== 'SUBSCRIBED') return;
          
          await channel.track({
            user_id: userId,
            email: userEmail.substring(0, userEmail.indexOf('@')) || userEmail,
            editing_section: null,
            online_at: new Date().toISOString()
          });
        });
        
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    const cleanup = setupPresence();
    return () => {
      cleanup.then(fn => fn && fn());
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
    const userEmail = data.user.email || 'Anonymous';
    
    const channel = supabase.channel(`draft-${currentDraft?.id}`);
    await channel.track({
      user_id: userId,
      email: userEmail.substring(0, userEmail.indexOf('@')) || userEmail,
      editing_section: sectionIdx,
      content: content || null,
      online_at: new Date().toISOString()
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

  if (!currentDraft) {
    return (
      <section className="border rounded p-8 flex flex-col items-center justify-center text-center space-y-4">
        <h3 className="text-xl font-medium">No solution draft available</h3>
        <p className="text-muted-foreground">
          Define your problem and requirements in the Topic tab, then generate a solution.
        </p>
        <Button
          className="mt-4"
          onClick={onRePrompt}
          disabled={loading}
        >
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
    return activeUsers.some(user => user.section === sectionIdx);
  };
  
  const getEditingUserForSection = (sectionIdx: number) => {
    return activeUsers.find(user => user.section === sectionIdx);
  };

  return (
    <section className="border rounded p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Draft v{currentDraft.id}</h2>
        <div className="flex items-center gap-2">
          {activeUsers.length > 0 && (
            <div className="flex -space-x-2 mr-2">
              {activeUsers.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
              {activeUsers.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">+{activeUsers.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
          {versions.length > 0 && (
            <select
              value={currentDraft.id}
              onChange={(e) =>
                setCurrentIdx(versions.findIndex((v) => v.id === +e.target.value))
              }
              className="text-sm border rounded p-1"
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.id}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {currentDraft.output.map((para, idx) => (
        <div key={idx} className="mb-6 relative">
          {editingSection === idx ? (
            <div className="space-y-2">
              <Textarea
                ref={editTextareaRef}
                value={editableContent}
                onChange={handleContentChange}
                className="min-h-[120px] w-full"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditCancel}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleEditSave(idx)}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div 
                className={`p-2 rounded ${
                  isUserEditingSection(idx) && editingSection !== idx 
                    ? "bg-yellow-50 border border-yellow-200" 
                    : ""
                }`}
              >
                {isUserEditingSection(idx) && editingSection !== idx && (
                  <Badge variant="outline" className="mb-1">
                    {getEditingUserForSection(idx)?.name} is editing...
                  </Badge>
                )}
                <p 
                  className={`${editingSection !== idx ? "cursor-pointer hover:bg-slate-50" : ""}`}
                  onClick={() => editingSection === null && handleEditStart(idx, para)}
                >
                  {editingSessions[idx] ? editingSessions[idx] : highlightChanges(para, idx)}
                </p>
              </div>

              <div className="flex items-center mt-2 gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 px-2 rounded-full"
                  onClick={() => setActiveThread(activeThread === idx ? null : idx)}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {activeThread === idx ? "Hide" : "Comment"}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 px-2 rounded-full"
                  onClick={() => editingSection === null && handleEditStart(idx, para)}
                >
                  Edit
                </Button>
              </div>

              {activeThread === idx && (
                <div className="mt-2">
                  <textarea
                    className="border w-full p-2 mb-2 text-xs rounded-md"
                    placeholder="Leave feedback…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const val = (e.target as HTMLTextAreaElement).value;
                        if (val.trim()) addFeedback(idx, val.trim());
                        (e.target as HTMLTextAreaElement).value = "";
                        setActiveThread(null);
                      }
                    }}
                  />
                </div>
              )}

              {(currentDraft.sectionFeedback[idx] || []).map((fb) => (
                <div
                  key={fb.threadId}
                  className="text-xs bg-gray-100 p-2 rounded mb-1 mt-1"
                >
                  {fb.text}
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      <Button
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={onRePrompt}
        disabled={loading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Generating…" : "Re‑prompt"}
      </Button>
    </section>
  );
}
