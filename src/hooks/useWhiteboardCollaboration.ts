
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export type CursorPosition = {
  x: number;
  y: number;
  userId: string;
  userName: string;
  userColor: string;
};

export function useWhiteboardCollaboration(workshopId: string | null, canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userColor, setUserColor] = useState<string>("#9b87f5");
  
  useEffect(() => {
    // Generate a random user ID and name if not authenticated
    const randomId = Math.random().toString(36).substring(2, 10);
    setUserId(randomId);
    setUserName(`User-${randomId.substring(0, 4)}`);
    
    // Assign a random color
    const colors = ["#9b87f5", "#0EA5E9", "#F97316", "#D946EF", "#22C55E"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setUserColor(randomColor);
    
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        setUserName(data.user.email?.split("@")[0] || `User-${randomId.substring(0, 4)}`);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (!workshopId || !userId || !canvasRef.current) return;

    // Set up real-time presence channel
    const channel = supabase.channel(`whiteboard:${workshopId}`);

    // Handle cursor movements
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Only send updates every 50ms to prevent flooding
      if (Date.now() - lastUpdate > 50) {
        channel.track({
          userId,
          userName,
          userColor,
          cursor: { x, y }
        });
        lastUpdate = Date.now();
      }
    };

    let lastUpdate = 0;
    
    // Subscribe to real-time updates
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        
        const newCursors: CursorPosition[] = [];
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.userId !== userId && presence.cursor) {
              newCursors.push({
                x: presence.cursor.x,
                y: presence.cursor.y,
                userId: presence.userId,
                userName: presence.userName,
                userColor: presence.userColor
              });
            }
          });
        });
        
        setCursors(newCursors);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        // Optionally show a toast when someone joins
        if (newPresences.length > 0) {
          const user = newPresences[0];
          if (user.userId !== userId) {
            toast(`${user.userName} joined the whiteboard`, {
              duration: 2000
            });
          }
        }
      })
      .subscribe();

    // Add mouse move listener for cursor tracking
    if (canvasRef.current) {
      canvasRef.current.addEventListener("mousemove", handleMouseMove);
    }

    // Initial presence tracking
    channel.track({
      userId,
      userName,
      userColor,
      cursor: null
    });

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousemove", handleMouseMove);
      }
      supabase.removeChannel(channel);
    };
  }, [workshopId, userId, userName, userColor, canvasRef]);

  return { cursors, userId, userName, userColor };
}
