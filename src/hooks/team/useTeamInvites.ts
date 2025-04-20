
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export function useTeamInvites() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [workshopId, setWorkshopId] = useState<string | null>(null);

  // Get current workshop ID from URL
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setWorkshopId(id);
  });

  const inviteTeamMember = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!workshopId) {
      toast.error("Workshop ID not available");
      return;
    }

    setIsInviting(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const inviterId = userData.user?.id;
      
      if (!inviterId) {
        toast.error("You must be logged in to invite team members");
        setIsInviting(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: {
          workshopId,
          email: inviteEmail,
          inviterId
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        if (data.emailSent === false) {
          toast.warning(`Invitation created but email could not be sent. ${data.emailError || ''}`);
        } else {
          toast.success(`Invitation sent to ${inviteEmail}`);
        }
        
        setInviteEmail("");
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast.error("Failed to send invitation: " + (error.message || "Unknown error"));
    } finally {
      setIsInviting(false);
    }
  };

  return {
    inviteEmail,
    setInviteEmail,
    isInviting,
    inviteTeamMember,
    workshopId
  };
}
