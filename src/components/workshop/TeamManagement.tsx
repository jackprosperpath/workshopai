
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Share, Copy, Check, X, Users, AlertCircle } from "lucide-react";
import { TeamMember, useTeamCollaboration } from "@/hooks/useTeamCollaboration";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function TeamManagement() {
  const location = useLocation();
  const {
    teamMembers,
    inviteEmail,
    setInviteEmail,
    isInviting,
    inviteTeamMember,
    removeTeamMember,
    generateShareableLink,
    copyLinkSuccess,
    workshopId
  } = useTeamCollaboration();

  // Check if URL contains invitation token
  useEffect(() => {
    const checkInvitation = async () => {
      const params = new URLSearchParams(location.search);
      const inviteToken = params.get('invite');
      
      if (inviteToken) {
        // In a real implementation, you would verify the invitation token
        // and update the invitation status to "accepted" in the database
        
        // For now, we'll just show a toast message
        toast.success("You've joined the workshop as a collaborator!");
        
        // Remove the invitation token from the URL
        const newUrl = window.location.pathname + location.search.replace(`&invite=${inviteToken}`, '').replace(`invite=${inviteToken}&`, '').replace(`invite=${inviteToken}`, '');
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    };
    
    checkInvitation();
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteTeamMember();
  };

  const getCurrentUserCount = () => {
    // This would normally come from a real-time presence subscription
    // For now, we'll just return a random number between 1 and 3
    return Math.floor(Math.random() * 3) + 1;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Collaboration
          {getCurrentUserCount() > 0 && (
            <Badge variant="outline" className="ml-2">
              {getCurrentUserCount()} {getCurrentUserCount() === 1 ? 'user' : 'users'} online
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Invite your team members to collaborate in real-time on this workshop
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="mb-4">
            <TabsTrigger value="email">Invite by Email</TabsTrigger>
            <TabsTrigger value="link">Shareable Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
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
                  />
                  <Button 
                    type="submit" 
                    disabled={isInviting}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isInviting ? "Sending..." : "Invite"}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="link">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a link that you can share with anyone to invite them to this workshop
              </p>
              <Button 
                onClick={generateShareableLink} 
                variant="outline" 
                className="w-full"
              >
                {copyLinkSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Share className="mr-2 h-4 w-4" />
                    Generate Shareable Link
                  </>
                )}
              </Button>
              {workshopId && (
                <div className="mt-2 p-2 bg-muted rounded-md text-xs font-mono break-all">
                  {`${window.location.origin}/workshop?id=${workshopId}`}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {teamMembers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Invited Team Members</h3>
            <ul className="space-y-2">
              {teamMembers.map((member) => (
                <TeamMemberItem 
                  key={member.id} 
                  member={member} 
                  onRemove={removeTeamMember} 
                />
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-6 p-3 bg-muted/50 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            All invited team members will be able to view and edit this workshop in real-time. 
            They will need a Consensus account to join. Changes are synchronized automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMemberItem({ member, onRemove }: { member: TeamMember; onRemove: (id: string) => void }) {
  return (
    <li className="flex items-center justify-between p-2 rounded-md bg-muted/50">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-1 rounded-full">
          <Mail className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{member.email}</p>
          <p className="text-xs text-muted-foreground">
            Invited {member.invitedAt.toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={
          member.status === "accepted" ? "default" : 
          member.status === "declined" ? "destructive" : 
          "outline"
        }>
          {member.status === "accepted" ? "Accepted" : 
           member.status === "declined" ? "Declined" : 
           "Pending"}
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
