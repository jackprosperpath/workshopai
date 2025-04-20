
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { TeamMember, useTeamMembers } from "@/hooks/team/useTeamMembers";
import { supabase } from "@/integrations/supabase/client";

export type Stakeholder = {
  id: number;
  role: string;
  status: "pending" | "yes" | "no";
  comment?: string;
  email?: string;
  inviteSent?: boolean;
};

export function useStakeholders() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [newRole, setNewRole] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const { teamMembers } = useTeamMembers();

  useEffect(() => {
    const initializeStakeholders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const existingEmails = new Set(stakeholders.map(s => s.email));
        
        const newStakeholders: Stakeholder[] = [];
        
        if (user?.email && !existingEmails.has(user.email)) {
          newStakeholders.push({
            id: Date.now(),
            role: "Workshop Owner",
            status: "pending",
            email: user.email,
            inviteSent: true
          });
        }
        
        teamMembers.forEach(member => {
          if (!existingEmails.has(member.email)) {
            newStakeholders.push({
              id: Date.now() + Math.random(),
              role: "Team Member",
              status: member.status === "accepted" ? "pending" : "pending",
              email: member.email,
              inviteSent: true
            });
          }
        });
        
        if (newStakeholders.length > 0) {
          setStakeholders(prev => [...prev, ...newStakeholders]);
        }
      } catch (error) {
        console.error("Error initializing stakeholders:", error);
      }
    };

    initializeStakeholders();
  }, [teamMembers]);

  const addStakeholder = () => {
    if (newRole.trim()) {
      setStakeholders((s) => [
        ...s,
        {
          id: Date.now(),
          role: newRole.trim(),
          status: "pending",
          email: newEmail.trim() || undefined,
          inviteSent: false
        }
      ]);
      setNewRole("");
      setNewEmail("");
    }
  };

  const updateStakeholder = (
    id: number,
    updates: Partial<Omit<Stakeholder, "id">>
  ) => {
    setStakeholders((s) =>
      s.map((st) => (st.id === id ? { ...st, ...updates } : st))
    );
  };

  const removeStakeholder = (id: number) => {
    setStakeholders((s) => s.filter((st) => st.id !== id));
  };

  const inviteStakeholder = async (id: number, workshopShareLink: string) => {
    setIsInviting(true);
    try {
      const stakeholder = stakeholders.find(s => s.id === id);
      if (!stakeholder || !stakeholder.email) {
        throw new Error("No email address found for this stakeholder");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateStakeholder(id, { inviteSent: true });
      toast.success(`Invite sent to ${stakeholder.email}`);
    } catch (error) {
      console.error("Error inviting stakeholder:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  return {
    stakeholders,
    newRole,
    setNewRole,
    newEmail,
    setNewEmail,
    isInviting,
    addStakeholder,
    updateStakeholder,
    removeStakeholder,
    inviteStakeholder
  };
}
