
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, AlertTriangle, Award } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useTeamInvites } from "@/hooks/team/useTeamInvites";

export function InviteForm() {
  const { 
    inviteEmail, 
    setInviteEmail, 
    isInviting, 
    inviteTeamMember, 
    error, 
    devMode,
    lastInviteResult,
    invitationsSent,
    hasUnlockedPremium
  } = useTeamInvites();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await inviteTeamMember();
  };

  const progressValue = Math.min(100, (invitationsSent / 3) * 100);

  return (
    <div className="space-y-5">
      {!hasUnlockedPremium && (
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Unlock Unlimited Drafts</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Invite 3 team members to unlock unlimited drafts in your workshops.
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>{invitationsSent} of 3 invitations sent</span>
              <span>{invitationsSent >= 3 ? "Unlocked!" : `${3 - invitationsSent} more to go`}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </div>
      )}

      {hasUnlockedPremium && (
        <Alert className="bg-primary/10 border-primary/20">
          <Award className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            You've unlocked unlimited drafts! Enjoy creating as many solutions as you need.
          </AlertDescription>
        </Alert>
      )}

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
        
        {devMode && lastInviteResult && (
          <Alert variant="warning" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <p className="font-medium">Development Mode:</p> 
              <p>
                {lastInviteResult.emailSent === false ? 
                  "Email couldn't be sent due to Resend development restrictions." : 
                  `Email was sent to ${lastInviteResult.emailSentTo} instead of ${lastInviteResult.invitation.email}.`}
              </p>
              <p className="mt-1">
                To send emails to other addresses, verify a domain at{" "}
                <a 
                  href="https://resend.com/domains" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  resend.com/domains
                </a>
                , and update the "from" address.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
