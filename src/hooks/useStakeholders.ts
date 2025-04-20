
import { useState, useEffect, useCallback } from "react";
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
  const [workshopId, setWorkshopId] = useState<string | null>(null);
  
  // Get current workshop ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setWorkshopId(id);
  }, []);
  
  const { teamMembers } = useTeamMembers(workshopId);

  // Track initialized stakeholders to avoid duplicate additions
  const [initializedStakeholderEmails, setInitializedStakeholderEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initializeStakeholders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const newStakeholders: Stakeholder[] = [];
        
        // Add workshop owner if not already added
        if (user?.email && !initializedStakeholderEmails.has(user.email)) {
          newStakeholders.push({
            id: Date.now(),
            role: "Workshop Owner",
            status: "pending",
            email: user.email,
            inviteSent: true
          });
          
          // Add to tracking set
          setInitializedStakeholderEmails(prev => new Set([...prev, user.email]));
        }
        
        // Add team members if not already added
        teamMembers.forEach(member => {
          if (member.email && !initializedStakeholderEmails.has(member.email)) {
            newStakeholders.push({
              id: Date.now() + Math.random(),
              role: "Team Member",
              status: member.status === "accepted" ? "pending" : "pending",
              email: member.email,
              inviteSent: true
            });
            
            // Add to tracking set
            setInitializedStakeholderEmails(prev => new Set([...prev, member.email]));
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
  }, [teamMembers, initializedStakeholderEmails]);

  const addStakeholder = useCallback(() => {
    if (newRole.trim()) {
      const email = newEmail.trim() || undefined;
      
      // Check if this email is already in the list
      if (email && stakeholders.some(s => s.email === email)) {
        toast.error("A stakeholder with this email already exists");
        return;
      }
      
      setStakeholders((s) => [
        ...s,
        {
          id: Date.now(),
          role: newRole.trim(),
          status: "pending",
          email,
          inviteSent: false
        }
      ]);
      
      // If we added a stakeholder with email, track it
      if (email) {
        setInitializedStakeholderEmails(prev => new Set([...prev, email]));
      }
      
      setNewRole("");
      setNewEmail("");
    } else {
      toast.error("Please enter a stakeholder role");
    }
  }, [newRole, newEmail, stakeholders]);

  const updateStakeholder = useCallback((
    id: number,
    updates: Partial<Omit<Stakeholder, "id">>
  ) => {
    setStakeholders((s) =>
      s.map((st) => (st.id === id ? { ...st, ...updates } : st))
    );
  }, []);

  const removeStakeholder = useCallback((id: number) => {
    setStakeholders((s) => {
      const stakeholderToRemove = s.find(st => st.id === id);
      
      // If the stakeholder has an email, remove it from our tracking set
      if (stakeholderToRemove?.email) {
        setInitializedStakeholderEmails(prev => {
          const newSet = new Set(prev);
          newSet.delete(stakeholderToRemove.email!);
          return newSet;
        });
      }
      
      return s.filter((st) => st.id !== id);
    });
  }, []);

  const inviteStakeholder = useCallback(async (id: number, workshopShareLink: string) => {
    setIsInviting(true);
    try {
      const stakeholder = stakeholders.find(s => s.id === id);
      if (!stakeholder || !stakeholder.email) {
        throw new Error("No email address found for this stakeholder");
      }

      if (!workshopId) {
        throw new Error("Workshop ID not available");
      }

      const { data: userData } = await supabase.auth.getUser();
      const inviterId = userData.user?.id;
      
      if (!inviterId) {
        throw new Error("You must be logged in to invite stakeholders");
      }
      
      // Call the edge function to send the invitation
      console.log("Sending invitation with:", {
        workshopId,
        email: stakeholder.email,
        inviterId,
        role: stakeholder.role
      });
      
      const { data, error } = await supabase.functions.invoke('invite-stakeholder', {
        body: {
          workshopId,
          email: stakeholder.email,
          inviterId,
          role: stakeholder.role
        }
      });
      
      if (error) {
        console.error("Error from edge function:", error);
        throw new Error(`Failed to send invitation: ${error.message || "Unknown error"}`);
      }
      
      console.log("Invitation response:", data);
      
      if (data && data.success) {
        updateStakeholder(id, { inviteSent: true });
        toast.success(`Invite sent to ${stakeholder.email}`);
      } else {
        throw new Error(data?.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error inviting stakeholder:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  }, [stakeholders, workshopId, updateStakeholder]);

  return {
    stakeholders,
    newRole,
    setNewRole,
    newEmail,
    setNewEmail,
    isInviting,
    workshopId,
    addStakeholder,
    updateStakeholder,
    removeStakeholder,
    inviteStakeholder
  };
}
