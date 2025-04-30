
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useSearchParams } from "react-router-dom";
import { CalendarIntegrationInfo } from "@/components/workshop/CalendarIntegrationInfo";
import { Button } from "@/components/ui/button";

export function WorkshopActions() {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateNewWorkshop = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast.error("Please sign in to create a workshop");
        return;
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

      if (error) throw error;
      
      toast.success("New workshop created");
      navigate(`/workshop?id=${workshop.id}`);
    } catch (error) {
      console.error("Error creating workshop:", error);
      toast.error("Failed to create workshop");
    }
  };

  const handleSaveWorkshop = async (
    problem: string,
    metrics: string[],
    constraints: string[],
    selectedModel: string
  ) => {
    if (!workshopId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('workshops')
        .update({
          problem,
          metrics,
          constraints,
          selected_model: selectedModel,
          updated_at: new Date().toISOString()
        })
        .eq('id', workshopId);

      if (error) throw error;
      toast.success("Workshop saved successfully");
    } catch (error) {
      console.error("Error saving workshop:", error);
      toast.error("Failed to save workshop");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <Button onClick={handleCreateNewWorkshop}>
          Create New Workshop
        </Button>
      </div>
      
      {/* Add Calendar Integration Info */}
      <CalendarIntegrationInfo />
    </div>
  );
}
