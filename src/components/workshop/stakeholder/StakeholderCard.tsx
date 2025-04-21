
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { type Stakeholder } from "@/hooks/useStakeholders";
import { UserX, Check, X, MessageSquare } from "lucide-react";
import React, { useState } from "react";

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  onUpdate: (updates: Partial<Omit<Stakeholder, "id">>) => void;
  onRemove: () => void;
}

export function StakeholderCard({ stakeholder, onUpdate, onRemove }: StakeholderCardProps) {
  const { role, status, email, comment } = stakeholder;
  const [showComment, setShowComment] = useState(Boolean(comment));
  const [commentValue, setCommentValue] = useState(comment || "");

  // Update comment in parent on blur or Enter
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentValue(e.target.value);
  };

  const handleCommentBlur = () => {
    if (commentValue !== comment) {
      onUpdate({ comment: commentValue });
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLTextAreaElement).blur();
    }
  };

  const statusLabel =
    status === "yes" ? "Approved" :
    status === "no" ? "Rejected" :
    "Pending";

  const statusVariant =
    status === "yes" ? "default" :
    status === "no" ? "destructive" :
    "secondary";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{role}</h3>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          {email && (
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
          )}
          <div className="flex gap-2 mt-2">
            {status !== "yes" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate({ status: "yes" })}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" /> Approve
              </Button>
            )}
            {status !== "no" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onUpdate({ status: "no" })}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Reject
              </Button>
            )}
            <Button
              type="button"
              size="icon"
              variant={showComment ? "secondary" : "ghost"}
              title="Add/View Comment"
              className="flex-shrink-0"
              onClick={() => setShowComment((v) => !v)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
          {showComment && (
            <Textarea
              className="mt-2 w-full"
              placeholder="Add a comment (optional)"
              value={commentValue}
              rows={2}
              onChange={handleCommentChange}
              onBlur={handleCommentBlur}
              onKeyDown={handleCommentKeyDown}
              aria-label="Stakeholder comment"
            />
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="flex-shrink-0"
          title="Remove stakeholder"
        >
          <UserX className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
