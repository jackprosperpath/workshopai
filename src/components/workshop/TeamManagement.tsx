
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, AlertCircle, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { InviteForm } from "./team/InviteForm";
import { ShareableLink } from "./team/ShareableLink";
import { TeamMemberList } from "./team/TeamMemberList";
import { AiModel, usePromptCanvas } from "@/hooks/usePromptCanvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function TeamManagement() {
  const { teamMembers, removeTeamMember } = useTeamMembers(
    new URLSearchParams(window.location.search).get('id')
  );
  const { selectedModel, setSelectedModel } = usePromptCanvas();
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

          <TeamMemberList members={teamMembers} onRemove={removeTeamMember} />
          
          <div className="mt-6 p-3 bg-muted/50 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              All invited team members will be able to view and edit this workshop in real-time. 
              They will need a WorkshopAI account to join. Changes are synchronised automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Models
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
