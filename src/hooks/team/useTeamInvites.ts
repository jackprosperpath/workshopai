
// Remove all draft/unlock logic, always enable premium for everyone.
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

// All users now always have premium/unlimited drafts unlocked.
export function useTeamInvites() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [workshopId, setWorkshopId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [lastInviteResult, setLastInviteResult] = useState<InviteResult | null>(null);

  // Get current workshop ID from URL once; devMode flag only for edge case UI
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') ?? params.get('share');
    if (id) setWorkshopId(id);
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
    setDevMode(isDev);
  }, []);

  // Invitation still works, but does NOT impact premium/unlocked state.
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
      // Only calls the backend, no limit logic.
      const response: { data: any; error: any } = await supabase.functions.invoke('invite-team-member', {
        body: {
          workshopId,
          email: inviteEmail,
          inviterId
        }
      });
      
      const { data, error: inviteError } = response;

      if (data && data.error) {
        if (data.error.includes("already been invited")) {
          toast({
            description: data.error,
            variant: "default"
          });
          setInviteEmail("");
          return;
        }
        throw new Error(data.error);
      }
      if (inviteError) {
        throw new Error(`Failed to send invitation: ${inviteError.message || "Unknown error"}`);
      }

      // Show toast for success, ignore limits.
      if (data && data.success) {
        // Show development-mode alerts for email delivery status, if needed
        if (data.isDevelopment || data.emailSent === false) {
          setLastInviteResult(data);
        }
        if (data.emailSent === false) {
          if (devMode) {
            toast({
              description: "Invitation created but email could not be sent due to development restrictions.",
              variant: "default"
            });
          } else {
            toast({
              description: `Invitation created but email could not be sent. ${data.emailError || ''}`,
              variant: "default"
            });
          }
        } else if (data.isDevelopment && data.emailSentTo !== data.invitation.email) {
          toast({
            description: `Invitation created and development email sent to ${data.emailSentTo}`,
            variant: "default"
          });
        } else {
          toast({
            description: `Invitation sent to ${inviteEmail}`,
            variant: "default"
          });
        }
        setInviteEmail("");
      } else {
        throw new Error(data?.error || "Unknown error occurred");
      }
    } catch (error: any) {
      setError("Failed to send invitation: " + (error.message || "Unknown error"));
      toast({
        description: "Failed to send invitation: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Always unlocked, invitationsSent always 0, no effect.
  return {
    inviteEmail,
    setInviteEmail,
    isInviting,
    inviteTeamMember,
    workshopId,
    error,
    devMode,
    lastInviteResult,
    invitationsSent: 0,
    hasUnlockedPremium: true
  };
}
