
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { InviteForm } from "./team/InviteForm";
import { ShareableLink } from "./team/ShareableLink";
import { TeamMemberList } from "./team/TeamMemberList";

export function TeamManagement() {
  const { teamMembers, removeTeamMember, updateTeamMemberRole } = useTeamMembers(
    new URLSearchParams(window.location.search).get('id')
  );
  const getCurrentUserCount = () => Math.floor(Math.random() * 3) + 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team
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
              <InviteForm />
            </TabsContent>
            
            <TabsContent value="link">
              <ShareableLink />
            </TabsContent>
          </Tabs>

          <TeamMemberList 
            members={teamMembers} 
            onRemove={removeTeamMember} 
            onUpdateRole={updateTeamMemberRole}
          />
          
          <div className="mt-6 p-3 bg-muted/50 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p>
                All invited team members will be able to view and edit this workshop in real-time. 
                They will need a WorkshopAI account to join. Changes are synchronised automatically.
              </p>
              <p className="mt-2">
                <strong>Adding roles</strong> to team members will automatically include them in your workshop design as attendees.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
