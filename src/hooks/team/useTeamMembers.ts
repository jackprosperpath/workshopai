
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export type TeamMember = {
  id: string;
  email: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: Date;
  role?: string;
};

export function useTeamMembers(workshopId: string | null) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

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
            status: collab.status as "pending" | "accepted" | "declined",
            invitedAt: new Date(collab.invited_at),
            role: collab.role
          }))
        );
      } catch (error) {
        console.error("Error loading collaborators:", error);
      }
    };

    loadCollaborators();

    // Set up real-time subscription for collaborator updates
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
          loadCollaborators();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workshopId]);

  const updateTeamMemberRole = async (id: string, role: string) => {
    if (!workshopId) {
      toast.error("Workshop ID not available");
      return;
    }

    try {
      const { error } = await supabase
        .from('workshop_collaborators')
        .update({ role })
        .eq('id', id);
      
      if (error) throw error;
      
      setTeamMembers(prev => prev.map(member => 
        member.id === id ? { ...member, role } : member
      ));
      toast.success("Team member role updated");
    } catch (error) {
      console.error("Error updating team member role:", error);
      toast.error("Failed to update team member role");
    }
  };

  const removeTeamMember = async (id: string) => {
    if (!workshopId) {
      toast.error("Workshop ID not available");
      return;
    }

    try {
      const { error } = await supabase
        .from('workshop_collaborators')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTeamMembers(prev => prev.filter(member => member.id !== id));
      toast.success("Team member removed");
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member");
    }
  };

  return { teamMembers, removeTeamMember, updateTeamMemberRole };
}
