
import { useState } from "react";
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
      console.log('Current User Data:', userData); // Diagnostic log

      if (!userData.user) {
        toast.error("Please sign in to create a workshop");
        console.error('No user found when trying to create workshop'); // Diagnostic log
        return null;
      }

      const { data: workshop, error } = await supabase
        .from('workshops')
        .insert([{
          owner_id: userData.user.id,
          share_id: crypto.randomUUID().substring(0, 8),
          name: "Untitled Workshop"
        }])
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      if (!workshop) {
        console.error('No workshop returned from database'); // Diagnostic log
        throw new Error("No workshop returned from database");
      }

      console.log('Created Workshop:', workshop); // Diagnostic log
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
      // First try to find by UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUuid = uuidRegex.test(id);
      
      let query;
      if (isValidUuid) {
        // If it's a valid UUID, query by id
        query = supabase
          .from('workshops')
          .select('*')
          .eq('id', id)
          .single();
      } else {
        // If not a valid UUID, try by share_id
        query = supabase
          .from('workshops')
          .select('*')
          .eq('share_id', id)
          .single();
      }

      const { data: workshop, error } = await query;

      if (error) {
        console.error("Error fetching workshop:", error);
        throw error;
      }
      
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
