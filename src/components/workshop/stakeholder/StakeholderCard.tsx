
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Trash2, Mail } from "lucide-react";
import type { Stakeholder } from "@/hooks/useStakeholders";

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  isInviting?: boolean;
  onUpdate: (updates: Partial<Omit<Stakeholder, "id">>) => void;
  onRemove: () => void;
  onInvite: () => void;
}

export function StakeholderCard({ 
  stakeholder, 
  isInviting,
  onUpdate, 
  onRemove,
  onInvite 
}: StakeholderCardProps) {
  return (
    <div className="border rounded-md p-3 bg-muted/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{stakeholder.role}</span>
          {stakeholder.email && (
            <span className="text-xs text-muted-foreground">{stakeholder.email}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {stakeholder.email && !stakeholder.inviteSent && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onInvite}
              disabled={isInviting}
            >
              <Mail className="h-4 w-4 mr-1" />
              Invite
            </Button>
          )}
          {stakeholder.inviteSent && (
            <span className="text-xs text-muted-foreground">Invite sent</span>
          )}
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              className={`p-1 px-2 ${
                stakeholder.status === "yes" ? "bg-green-100 text-green-600" : ""
              }`}
              onClick={() => onUpdate({ status: "yes" })}
              title="Approve"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button
              className={`p-1 px-2 ${
                stakeholder.status === "no" ? "bg-red-100 text-red-600" : ""
              }`}
              onClick={() => onUpdate({ status: "no" })}
              title="Reject"
            >
              <XCircle className="h-4 w-4" />
            </button>
            <button
              className="p-1 px-2 hover:bg-muted"
              onClick={onRemove}
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <Textarea
        placeholder="Add feedback or comments here..."
        value={stakeholder.comment || ""}
        onChange={(e) => onUpdate({ comment: e.target.value })}
        className="mt-2 min-h-[80px] text-sm"
      />
      <div className="mt-2 flex justify-end">
        <div className="text-xs font-medium rounded-full px-2 py-1 inline-flex items-center gap-1">
          {stakeholder.status === "pending" && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
              Pending
            </span>
          )}
          {stakeholder.status === "yes" && (
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Approved
            </span>
          )}
          {stakeholder.status === "no" && (
            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
              Rejected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
