
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTeamInvites } from "@/hooks/team/useTeamInvites";

export function InviteForm() {
  const { inviteEmail, setInviteEmail, isInviting, inviteTeamMember, error } = useTeamInvites();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await inviteTeamMember();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="email-invite">Email address</Label>
        <div className="flex gap-2">
          <Input
            id="email-invite"
            placeholder="colleague@example.com"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={isInviting}
            required
          />
          <Button type="submit" disabled={isInviting || !inviteEmail.trim()}>
            {isInviting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Invite
              </>
            )}
          </Button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </form>
  );
}
