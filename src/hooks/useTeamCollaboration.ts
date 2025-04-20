
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

  // Get current workshop ID from URL or create one if needed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const workshopIdFromUrl = params.get('id');
    
    if (workshopIdFromUrl) {
      setWorkshopId(workshopIdFromUrl);
      fetchTeamMembers(workshopIdFromUrl);
    } else {
      // In a real app, you would create a new workshop in the database
      // and then set the workshop ID
      const dummyWorkshopId = `workshop-${Date.now()}`;
      setWorkshopId(dummyWorkshopId);
      
      // Update URL with workshop ID without reloading
      const newUrl = `${window.location.pathname}?id=${dummyWorkshopId}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  }, []);

  // Fetch team members for this workshop
  const fetchTeamMembers = async (workshopId: string) => {
    try {
      // In a real implementation, you would fetch team members from your database
      // For now, we'll just use the local state
      console.log(`Fetching team members for workshop ${workshopId}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, we would fetch from Supabase
      // const { data, error } = await supabase
      //   .from('workshop_invitations')
      //   .select('*')
      //   .eq('workshop_id', workshopId);
      
      // if (error) throw error;
      // setTeamMembers(data);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    }
  };

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
    workshopId
  };
}
