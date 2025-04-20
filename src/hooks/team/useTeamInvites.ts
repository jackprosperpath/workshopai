
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export function useTeamInvites() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [workshopId, setWorkshopId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current workshop ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setWorkshopId(id);
  }, []);

  const inviteTeamMember = async () => {
    setError(null);
    
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!workshopId) {
      setError("Workshop ID not available");
      return;
    }

    setIsInviting(true);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error("Authentication error: " + userError.message);
      }
      
      const inviterId = userData.user?.id;
      
      if (!inviterId) {
        throw new Error("You must be logged in to invite team members");
      }
      
      console.log("Sending team invitation with:", {
        workshopId,
        email: inviteEmail,
        inviterId
      });
      
      const { data, error: inviteError } = await supabase.functions.invoke('invite-team-member', {
        body: {
          workshopId,
          email: inviteEmail,
          inviterId
        }
      });
      
      // Check if data contains an error response (which could be from a 400 status)
      if (data && data.error) {
        // For duplicate invites, show a warning instead of an error
        if (data.error.includes("already been invited")) {
          toast.warning(data.error);
          setInviteEmail("");
          return;
        } else {
          throw new Error(data.error);
        }
      }
      
      if (inviteError) {
        console.error("Error from edge function:", inviteError);
        throw new Error(`Failed to send invitation: ${inviteError.message || "Unknown error"}`);
      }
      
      console.log("Invitation response:", data);
      
      if (data && data.success) {
        if (data.emailSent === false) {
          toast.warning(`Invitation created but email could not be sent. ${data.emailError || ''}`);
        } else {
          toast.success(`Invitation sent to ${inviteEmail}`);
        }
        
        setInviteEmail("");
      } else {
        throw new Error(data?.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
      setError("Failed to send invitation: " + (error.message || "Unknown error"));
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
    workshopId,
    error
  };
}
