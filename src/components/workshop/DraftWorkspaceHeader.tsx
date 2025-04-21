
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import ActiveUsersAvatars from "./ActiveUsersAvatars";
import DraftVersionSelector from "./DraftVersionSelector";

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
  handleCancelEditingDraft,
}: any) {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h2 className="font-semibold">Draft v{currentDraft.id}</h2>
      <div className="flex items-center gap-2">
        <ActiveUsersAvatars activeUsers={activeUsers} />
        <DraftVersionSelector
          versions={versions}
          currentDraftId={currentDraft.id}
          onSelect={setCurrentIdx}
          onCompare={onCompare}
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
  );
}
