
import { CursorPosition } from "@/hooks/useWhiteboardCollaboration";

interface CollaboratorCursorsProps {
  cursors: CursorPosition[];
}

export function CollaboratorCursors({ cursors }: CollaboratorCursorsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute flex flex-col items-start"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: "translate(10px, 10px)"
          }}
        >
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: cursor.userColor }}
          />
          <div
            className="text-xs px-1 py-0.5 rounded whitespace-nowrap"
            style={{ 
              backgroundColor: cursor.userColor,
              color: "#fff",
              marginTop: "2px"
            }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
    </div>
  );
}
