
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, X, Check, UserPlus } from "lucide-react";
import { TeamMember } from "@/hooks/team/useTeamMembers";

interface TeamMemberListProps {
  members: TeamMember[];
  onRemove: (id: string) => void;
  onUpdateRole: (id: string, role: string) => void;
}

export function TeamMemberList({ members, onRemove, onUpdateRole }: TeamMemberListProps) {
  if (members.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Team Members</h3>
      <ul className="space-y-2">
        {members.map((member) => (
          <TeamMemberItem 
            key={member.id} 
            member={member} 
            onRemove={onRemove} 
            onUpdateRole={onUpdateRole}
          />
        ))}
      </ul>
    </div>
  );
}

function TeamMemberItem({ 
  member, 
  onRemove, 
  onUpdateRole 
}: { 
  member: TeamMember; 
  onRemove: (id: string) => void;
  onUpdateRole: (id: string, role: string) => void;
}) {
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [roleInput, setRoleInput] = useState(member.role || "");

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

  const handleSaveRole = () => {
    if (roleInput.trim()) {
      onUpdateRole(member.id, roleInput.trim());
      setIsEditingRole(false);
    }
  };

  return (
    <li className="flex flex-col p-3 rounded-md bg-muted/50">
      <div className="flex items-center justify-between">
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
      </div>
      
      <div className="mt-2 pt-2 border-t border-muted">
        {isEditingRole ? (
          <div className="flex gap-2 items-center">
            <Input
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="Enter role (e.g., Designer, Developer)"
              className="text-xs h-7"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveRole}
              className="h-7 w-7 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <UserPlus className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Role:</span>
              {member.role ? (
                <span className="text-xs font-medium">{member.role}</span>
              ) : (
                <span className="text-xs italic text-muted-foreground">No role assigned</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingRole(true)}
              className="h-6 text-xs py-0 px-2"
            >
              {member.role ? "Edit Role" : "Add Role"}
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
