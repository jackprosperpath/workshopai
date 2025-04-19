
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function useWorkshop() {
  const [loading, setLoading] = useState(true);
  const [workshopName, setWorkshopName] = useState<string>("");
  const navigate = useNavigate();

  const createWorkshop = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Please sign in to create a workshop");
        return null;
      }

      const { data: workshop, error } = await supabase
        .from('workshops')
        .insert([{
          owner_id: userData.user.id,
          share_id: crypto.randomUUID().substring(0, 8),
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("New workshop created");
      navigate(`/workshop?id=${workshop.id}`);
      return workshop;
    } catch (error) {
      console.error("Error creating workshop:", error);
      toast.error("Failed to create workshop");
      return null;
    }
  };

  const getWorkshop = async (id: string) => {
    try {
      const { data: workshop, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setWorkshopName(workshop.name);
      return workshop;
    } catch (error) {
      console.error("Error fetching workshop:", error);
      toast.error("Failed to load workshop");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    workshopName,
    createWorkshop,
    getWorkshop
  };
}
