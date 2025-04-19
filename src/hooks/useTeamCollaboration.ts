
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export type TeamMember = {
  id: string;
  email: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: Date;
};

export function useTeamCollaboration() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);

  const inviteTeamMember = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if email is already invited
    if (teamMembers.some(member => member.email === inviteEmail)) {
      toast.error("This email has already been invited");
      return;
    }

    setIsInviting(true);
    
    try {
      // In a real implementation, this would send an email via a Supabase edge function
      // For now, we'll simulate the invitation process
      
      // Add the new team member to the state
      const newMember: TeamMember = {
        id: Date.now().toString(),
        email: inviteEmail,
        status: "pending",
        invitedAt: new Date()
      };
      
      setTeamMembers(prev => [...prev, newMember]);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    toast.success("Team member removed");
  };

  const generateShareableLink = () => {
    // In reality, this would create a unique workshop link in the database
    // For now, we'll just generate a dummy link
    const link = `${window.location.origin}/workshop?invite=${Date.now()}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopyLinkSuccess(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopyLinkSuccess(false), 3000);
      })
      .catch(err => {
        console.error("Could not copy link: ", err);
        toast.error("Failed to copy link");
      });
      
    return link;
  };

  return {
    teamMembers,
    inviteEmail,
    setInviteEmail,
    isInviting,
    inviteTeamMember,
    removeTeamMember,
    generateShareableLink,
    copyLinkSuccess
  };
}
