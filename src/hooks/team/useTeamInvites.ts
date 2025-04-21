
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InviteResult {
  success: boolean;
  emailSent: boolean;
  emailError?: string;
  emailSentTo?: string;
  isDevelopment?: boolean;
  invitation: {
    id: string;
    email: string;
    status: string;
  };
}

export function useTeamInvites() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [workshopId, setWorkshopId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [lastInviteResult, setLastInviteResult] = useState<InviteResult | null>(null);

  // Get current workshop ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Check for both id and share parameters for robustness
    const id = params.get('id') ?? params.get('share');
    if (id) setWorkshopId(id);
    
    // Check if we're in development mode
    const hostname = window.location.hostname;
    setDevMode(hostname === 'localhost' || hostname === '127.0.0.1');
  }, []);

  const inviteTeamMember = async () => {
    setError(null);
    setLastInviteResult(null);
    
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
          toast({
            description: data.error,
            variant: "default" // Changed from "warning" to "default"
          });
          setInviteEmail("");
          return; // Early return to prevent throwing error
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
        // Store the invitation result for dev mode display
        if (data.isDevelopment || data.emailSent === false) {
          setLastInviteResult(data);
        }
        
        if (data.emailSent === false) {
          if (devMode) {
            toast({
              description: "Invitation created but email could not be sent due to development restrictions.",
              variant: "default" // Changed from "warning" to "default"
            });
          } else {
            toast({
              description: `Invitation created but email could not be sent. ${data.emailError || ''}`,
              variant: "default" // Changed from "warning" to "default"
            });
          }
        } else if (data.isDevelopment && data.emailSentTo !== data.invitation.email) {
          toast({
            description: `Invitation created and development email sent to ${data.emailSentTo}`,
            variant: "default" // Changed from "success" to "default"
          });
        } else {
          toast({
            description: `Invitation sent to ${inviteEmail}`,
            variant: "default" // Changed from "success" to "default"
          });
        }
        
        setInviteEmail("");
      } else {
        throw new Error(data?.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
      setError("Failed to send invitation: " + (error.message || "Unknown error"));
      toast({
        description: "Failed to send invitation: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
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
    error,
    devMode,
    lastInviteResult
  };
}
