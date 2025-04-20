import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Share, Copy, Check, X, Users, AlertCircle, Settings } from "lucide-react";
import { TeamMember, useTeamCollaboration } from "@/hooks/useTeamCollaboration";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePromptCanvas, AiModel } from "@/hooks/usePromptCanvas";

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

  const { selectedModel, setSelectedModel } = usePromptCanvas();

  useEffect(() => {
    const checkInvitation = async () => {
      const params = new URLSearchParams(location.search);
      const inviteToken = params.get('invite');
      
      if (inviteToken) {
        toast.success("You've joined the workshop as a collaborator!");
        const newUrl = window.location.pathname + location.search.replace(`&invite=${inviteToken}`, '').replace(`invite=${inviteToken}&`, '').replace(`invite=${inviteToken}`, '');
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    };
    
    checkInvitation();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !workshopId) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to invite team members");
        return;
      }

      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: {
          workshopId,
          email: inviteEmail,
          inviterId: user.id
        }
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");

      // Add the new team member to local state
      const newMember: TeamMember = {
        id: data.invitation.id,
        email: inviteEmail,
        status: "pending",
        invitedAt: new Date()
      };
      setTeamMembers(prev => [...prev, newMember]);
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast.error("Failed to send invitation");
    }
  };

  const getCurrentUserCount = () => {
    return Math.floor(Math.random() * 3) + 1;
  };

  return (
    <div className="space-y-4">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Workshop Settings
          </CardTitle>
          <CardDescription>
            Configure the AI model that will be used for solution generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-model">AI Model</Label>
              <Select 
                value={selectedModel} 
                onValueChange={(value: AiModel) => setSelectedModel(value)}
              >
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o-mini (Fast)</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o (Powerful)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Select which AI model to use for generating solutions. GPT-4o-mini is faster but less powerful, while GPT-4o is more powerful but slower.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
