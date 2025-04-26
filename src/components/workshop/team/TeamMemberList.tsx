
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, X } from "lucide-react";
import { TeamMember } from "@/hooks/team/useTeamMembers";

interface TeamMemberListProps {
  members: TeamMember[];
  onRemove: (id: string) => void;
}

export function TeamMemberList({ members, onRemove }: TeamMemberListProps) {
  if (members.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Team Members</h3>
      <ul className="space-y-2">
        {members.map((member) => (
          <TeamMemberItem key={member.id} member={member} onRemove={onRemove} />
        ))}
      </ul>
    </div>
  );
}

function TeamMemberItem({ member, onRemove }: { member: TeamMember; onRemove: (id: string) => void }) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "declined":
        return "destructive";
      case "pending":
      default:
        return "secondary";
    }
  };

  return (
    <li className="flex items-center justify-between p-2 rounded-md bg-muted/50">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-1 rounded-full">
          <Mail className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{member.email}</p>
          <p className="text-xs text-muted-foreground">
            Invited {new Date(member.invitedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge 
          variant={getStatusBadgeVariant(member.status)}
          className="capitalize"
        >
          {member.status}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(member.id)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
