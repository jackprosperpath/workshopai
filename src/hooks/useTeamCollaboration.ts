
import { useState, useEffect } from "react";
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
  const [workshopId, setWorkshopId] = useState<string | null>(null);

  // Get current workshop ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setWorkshopId(id);
  }, []);

  // Load existing collaborators
  useEffect(() => {
    if (!workshopId) return;

    const loadCollaborators = async () => {
      try {
        const { data, error } = await supabase
          .from('workshop_collaborators')
          .select('*')
          .eq('workshop_id', workshopId);

        if (error) throw error;

        setTeamMembers(
          data.map(collab => ({
            id: collab.id,
            email: collab.email,
            status: collab.status as "pending" | "accepted" | "declined", // Type cast here
            invitedAt: new Date(collab.invited_at)
          }))
        );
      } catch (error) {
        console.error("Error loading collaborators:", error);
      }
    };

    loadCollaborators();

    // Set up real-time subscription
    const channel = supabase
      .channel('workshop-collaborators')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workshop_collaborators',
          filter: `workshop_id=eq.${workshopId}`
        },
        (payload) => {
          console.log('Collaboration change received:', payload);
          loadCollaborators(); // Reload collaborators when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workshopId]);

  const inviteTeamMember = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!workshopId) {
      toast.error("Workshop ID not available");
      return;
    }

    // Check if email is already invited
    if (teamMembers.some(member => member.email === inviteEmail)) {
      toast.error("This email has already been invited");
      return;
    }

    setIsInviting(true);
    
    try {
      // Call the Supabase Edge function to send the invitation
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: {
          workshopId,
          email: inviteEmail,
          inviterId: (await supabase.auth.getUser()).data.user?.id || 'anonymous'
        }
      });
      
      if (error) throw error;
      
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

  const removeTeamMember = async (id: string) => {
    if (!workshopId) {
      toast.error("Workshop ID not available");
      return;
    }

    try {
      // In a real implementation, you would remove the invitation from your database
      // For now, we'll just update the local state
      
      // const { error } = await supabase
      //   .from('workshop_invitations')
      //   .delete()
      //   .eq('id', id);
      
      // if (error) throw error;
      
      setTeamMembers(prev => prev.filter(member => member.id !== id));
      toast.success("Team member removed");
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const generateShareableLink = () => {
    if (!workshopId) {
      toast.error("Workshop ID not available");
      return "";
    }
    
    // Create a shareable link with the workshop ID
    const link = `${window.location.origin}/workshop?id=${workshopId}`;
    
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

  // Set up real-time updates for team members
  useEffect(() => {
    if (!workshopId) return;
    
    // In a real implementation, you would set up a real-time subscription 
    // to listen for changes to the team members
    
    // const channel = supabase
    //   .channel(`workshop:${workshopId}`)
    //   .on('postgres_changes', {
    //     event: '*',
    //     schema: 'public',
    //     table: 'workshop_invitations',
    //     filter: `workshop_id=eq.${workshopId}`
    //   }, (payload) => {
    //     console.log('Change received!', payload);
    //     fetchTeamMembers(workshopId);
    //   })
    //   .subscribe();
    
    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, [workshopId]);

  return {
    teamMembers,
    inviteEmail,
    setInviteEmail,
    isInviting,
    inviteTeamMember,
    removeTeamMember,
    generateShareableLink,
    copyLinkSuccess,
    workshopId,
    setTeamMembers // Export this function to make it available
  };
}
