import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Smile, SmilePlus } from "lucide-react";

type PresenceUser = {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  emoji: { emoji: string; x: number; y: number } | null;
  online_at: string;
};

const COLORS = [
  "#0ea5e9",
  "#16a34a",
  "#ef4444",
  "#8b5cf6",
  "#f59e42",
  "#ea580c",
  "#3b82f6"
];

function randomColor(seed: string) {
  let idx = 0;
  for (const char of seed) {
    idx += char.charCodeAt(0);
  }
  return COLORS[idx % COLORS.length];
}

const EMOJIS = ["👍", "👀", "😃", "💡", "👏", "🔥", "❓"];

type Props = {
  workshopId: string;
  workspaceRef: React.RefObject<HTMLDivElement> | null;
};

export function LivePresenceLayer({ workshopId, workspaceRef }: Props) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [pickedEmoji, setPickedEmoji] = useState<string | null>(null);
  const myColor = useRef<string | null>(null);
  const [myId, setMyId] = useState<string>("");
  const [emojis, setEmojis] = useState<{emoji: string, x: number, y: number, userId: string, timestamp: number}[]>([]);

  useEffect(() => {
    let channel: any;
    let running = true;
    let userId = "";
    let name = "";

    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id || Math.random().toString(36).slice(2);
      name =
        data.user?.email?.split("@")[0].slice(0, 6).toUpperCase() ||
        "GUEST" + userId.slice(0, 2);

      setMyId(userId);
      myColor.current = randomColor(userId);

      channel = supabase.channel(`workshop-cursors:${workshopId}`);

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const usersIn = Object.values(state)
            .flat()
            .map((u: any) => ({
              id: u.user_id,
              name: u.name,
              color: u.color,
              cursor: u.cursor,
              emoji: u.emoji,
              online_at: u.online_at,
            }));
          
          setUsers(usersIn);
          
          const newEmojis = usersIn
            .filter(u => u.emoji !== null)
            .map(u => ({
              emoji: u.emoji?.emoji || "",
              x: u.emoji?.x || 0,
              y: u.emoji?.y || 0,
              userId: u.id,
              timestamp: Date.now()
            }));
          
          if (newEmojis.length > 0) {
            setEmojis(prev => [...prev, ...newEmojis]);
          }
        })
        .on("presence", { event: "join" }, () => { /* optional: toast or animation */ })
        .on("presence", { event: "leave" }, () => { /* optional: toast or animation  */ })
        .subscribe(async (status: string) => {
          if (status !== "SUBSCRIBED") return;
          await channel.track({
            user_id: userId,
            name: name,
            color: myColor.current,
            cursor: null,
            emoji: null,
            online_at: new Date().toISOString(),
          });
        });
    }
    fetchUser();

    return () => {
      running = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [workshopId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setEmojis(prev => prev.filter(e => now - e.timestamp < 2000));
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!workspaceRef?.current || !myColor.current) return;
    let lastSent = 0;
    let unsub = false;

    const handleMove = (e: MouseEvent) => {
      const rect = workspaceRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (Date.now() - lastSent > 40) {
        lastSent = Date.now();
        const channel = supabase.channel(`workshop-cursors:${workshopId}`);
        channel.track({
          user_id: myId,
          color: myColor.current,
          cursor: { x, y },
          emoji: null,
          name: users.find((u) => u.id === myId)?.name || "Me",
          online_at: new Date().toISOString(),
        });
      }
    };

    workspaceRef.current.addEventListener("mousemove", handleMove);

    return () => {
      unsub = true;
      workspaceRef.current?.removeEventListener("mousemove", handleMove);
    };
  }, [workspaceRef, workshopId, myId, users]);

  const handleEmojiSelect = (emoji: string) => {
    if (!workspaceRef?.current || !myColor.current) return;
    
    setPickedEmoji(emoji);
    
    if (workspaceRef.current) {
      workspaceRef.current.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><text y='20' font-size='24'>${emoji}</text></svg>"), auto`;
    }

    const handleClick = (e: MouseEvent) => {
      const rect = workspaceRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const channel = supabase.channel(`workshop-cursors:${workshopId}`);
      channel.track({
        user_id: myId,
        color: myColor.current,
        cursor: { x, y },
        emoji: { emoji, x, y },
        name: users.find((u) => u.id === myId)?.name || "Me",
        online_at: new Date().toISOString(),
      });

      setTimeout(() => {
        if (workspaceRef.current) {
          workspaceRef.current.style.cursor = "default";
        }
        
        setTimeout(() => {
          channel.track({
            user_id: myId,
            color: myColor.current,
            cursor: { x, y },
            emoji: null,
            name: users.find((u) => u.id === myId)?.name || "Me",
            online_at: new Date().toISOString(),
          });
        }, 2000);
      }, 100);

      workspaceRef.current?.removeEventListener("click", handleClick);
      setPickedEmoji(null);
    };

    workspaceRef.current.addEventListener("click", handleClick, { once: true });
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-50 select-none">
      {users
        .filter((u) => u.cursor && u.id !== myId)
        .map((u) => (
          <div
            key={u.id}
            className="absolute flex items-center gap-1 animate-fade-in"
            style={{
              left: (u.cursor?.x ?? 0) - 14,
              top: (u.cursor?.y ?? 0) - 14,
              zIndex: 50,
              pointerEvents: "none"
            }}
          >
            <Avatar style={{ background: u.color, width: 28, height: 28 }}>
              <AvatarFallback className="text-[10px]">
                {u.name?.slice(0, 2) || "??"}
              </AvatarFallback>
            </Avatar>
          </div>
        ))}

      {users
        .filter((u) => u.emoji)
        .map((u) => (
          <div
            key={`emoji-${u.id}-${u.emoji?.emoji}`}
            className="absolute text-2xl pointer-events-none"
            style={{
              left: u.emoji?.x,
              top: u.emoji?.y,
              zIndex: 100,
              filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.1))",
              transform: "translate(-50%, -50%) scale(1.5)",
              animation: "pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
            }}
          >
            {u.emoji?.emoji}
          </div>
        ))}

      <div className="fixed bottom-4 left-4 bg-white shadow-lg rounded-md px-2 py-1 flex gap-2 z-[100] border border-slate-200 pointer-events-auto">
        <span className="font-semibold text-xs mr-2 text-muted-foreground flex items-center gap-1">
          React
          <SmilePlus className="inline h-3.5 w-3.5 ml-1" />
        </span>
        {EMOJIS.map((emo) => (
          <button
            key={emo}
            type="button"
            className={`bg-transparent transition-transform hover:scale-125 text-2xl ${pickedEmoji === emo ? 'ring-2 ring-blue-400 rounded-full' : ''}`}
            aria-label={`React with ${emo}`}
            onClick={() => handleEmojiSelect(emo)}
            disabled={!!pickedEmoji}
          >
            {emo}
          </button>
        ))}
      </div>

      <style>
        {`
          @keyframes pop-in {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            70% { transform: translate(-50%, -50%) scale(1.8); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

