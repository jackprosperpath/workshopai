
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function useDraftPresence(currentDraft) {
  const [activeUsers, setActiveUsers] = useState<
    { id: string; name: string; section: number | null; content?: string }[]
  >([]);
  const [editingSessions, setEditingSessions] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!currentDraft) return;

    const getUserInfo = async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    };

    const channel = supabase.channel(`draft-${currentDraft.id}`);
    let cleanup: (() => void) | undefined;

    const setupPresence = async () => {
      const user = await getUserInfo();
      if (!user) return;
      const userId = user.id;
      const userEmail = user.email || "Anonymous";
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
        .on("presence", { event: "join" }, ({ newPresences }) => {
          const newUser = newPresences[0];
          toast.info(`${newUser.email} joined the session`);
        })
        .on("presence", { event: "leave" }, ({ leftPresences }) => {
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
      cleanup = () => {
        supabase.removeChannel(channel);
      };
    };

    setupPresence();
    return () => {
      cleanup && cleanup();
    };
  }, [currentDraft]);

  return { activeUsers, editingSessions };
}
