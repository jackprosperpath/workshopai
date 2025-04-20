
import { useState, useCallback, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export type Stakeholder = {
  id: number;
  role: string;
  status: "pending" | "yes" | "no";
  comment?: string;
  email?: string;
};

export function useStakeholders() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [newRole, setNewRole] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [workshopId, setWorkshopId] = useState<string | null>(null);
  
  // Get current workshop ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setWorkshopId(id);
  }, []);
  
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
            email: user.email
          });
          
          setInitializedStakeholderEmails(prev => new Set([...prev, user.email]));
        }
        
        if (newStakeholders.length > 0) {
          setStakeholders(prev => [...prev, ...newStakeholders]);
        }
      } catch (error) {
        console.error("Error initializing stakeholders:", error);
      }
    };

    initializeStakeholders();
  }, [initializedStakeholderEmails]);

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
          email
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

  return {
    stakeholders,
    newRole,
    setNewRole,
    newEmail,
    setNewEmail,
    workshopId,
    addStakeholder,
    updateStakeholder,
    removeStakeholder
  };
}
