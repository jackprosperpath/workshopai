
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  PencilLine, 
  X, 
  History, 
  ArrowLeftRight 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DraftVersionSelector from "./DraftVersionSelector";
import ActiveUsersAvatars from "./ActiveUsersAvatars";
import type { DraftVersion } from "@/hooks/useDraftWorkspace";

export function DraftWorkspaceHeader({
  currentDraft,
  versions,
  currentIdx,
  setCurrentIdx,
  activeUsers,
  onCompare,
  comments,
  showCommentsSidebar,
  setShowCommentsSidebar,
  editingDraft,
  handleStartEditingDraft,
  handleCancelEditingDraft
}: {
  currentDraft: DraftVersion | null;
  versions: DraftVersion[];
  currentIdx: number | null;
  setCurrentIdx: (idx: number) => void;
  activeUsers: { id: string; name: string; section: number | null }[];
  onCompare: (oldIdx: number, newIdx: number) => void;
  comments: any[];
  showCommentsSidebar: boolean;
  setShowCommentsSidebar: (show: boolean) => void;
  editingDraft: boolean;
  handleStartEditingDraft: () => void;
  handleCancelEditingDraft: () => void;
}) {
  const totalComments = comments.length || 0;
  
  return (
    <div className="flex justify-between items-center border-b p-4 gap-4">
      <div className="flex gap-2 items-center">
        <DraftVersionSelector
          versions={versions}
          currentIdx={currentIdx}
          setCurrentIdx={setCurrentIdx}
          onCompare={onCompare}
        />
      </div>
      <div className="flex gap-2 items-center">
        <ActiveUsersAvatars users={activeUsers} />
        
        <Button
          size="sm"
          variant={showCommentsSidebar ? "secondary" : "outline"}
          className="flex items-center gap-1"
          onClick={() => setShowCommentsSidebar(!showCommentsSidebar)}
        >
          <MessageSquare className="h-4 w-4" />
          Comments
          {totalComments > 0 && !showCommentsSidebar && (
            <Badge variant="secondary" className="ml-1">
              {totalComments}
            </Badge>
          )}
        </Button>
        
        {editingDraft ? (
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500"
            onClick={handleCancelEditingDraft}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel editing
          </Button>
        ) : (
          <Button size="sm" onClick={handleStartEditingDraft}>
            <PencilLine className="h-4 w-4 mr-1" />
            Edit draft
          </Button>
        )}
      </div>
    </div>
  );
}
