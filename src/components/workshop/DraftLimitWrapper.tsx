import React from "react";
import { useTeamInvites } from "@/hooks/team/useTeamInvites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Users, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DraftLimitWrapperProps {
  children: React.ReactNode;
  draftsCount: number;
  onNavigateToTeam: () => void;
}

export function DraftLimitWrapper({ children, draftsCount, onNavigateToTeam }: DraftLimitWrapperProps) {
  const { invitationsSent, hasUnlockedPremium } = useTeamInvites();
  
  // If premium unlocked or first draft, show children
  if (hasUnlockedPremium || draftsCount === 0) {
    return <>{children}</>;
  }
  
  // Otherwise show limit reached UI
  const progressValue = Math.min(100, (invitationsSent / 3) * 100);
  
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" /> 
          Draft Limit Reached
        </CardTitle>
        <CardDescription>
          Invite team members to unlock unlimited drafts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sm font-medium">
                {invitationsSent} of 3 invitations sent
              </span>
              <span>{invitationsSent >= 3 ? "Unlocked!" : `${3 - invitationsSent} more to go`}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">
            You've used your free draft. Invite 3 team members to unlock unlimited drafts and access all premium features.
          </p>
          
          <Button 
            onClick={onNavigateToTeam} 
            className="w-full flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Invite Team Members
          </Button>
          
          <div className="flex items-start gap-2 mt-4 text-muted-foreground">
            <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              Your team will be able to collaborate on this workshop in real-time, 
              and you'll unlock unlimited drafts to perfect your solution.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
