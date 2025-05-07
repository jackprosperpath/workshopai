
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useWorkshopPersistence } from "@/hooks/useWorkshopPersistence";
import type { Blueprint, Attendee } from "@/components/workshop/types/workshop";

export function useBlueprintGenerator() {
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { saveWorkshopData, saveGeneratedBlueprint } = useWorkshopPersistence();

  const generateBlueprint = async ({
    problem,
    metrics,
    constraints,
    selectedModel,
    selectedFormat,
    customFormat,
    duration,
    workshopType,
    workshopName,
    workshopId,
    attendees
  }: {
    problem: string;
    metrics: string[];
    constraints: string[];
    selectedModel: string;
    selectedFormat: any;
    customFormat: string;
    duration: number;
    workshopType: 'online' | 'in-person';
    workshopName: string;
    workshopId: string | null;
    attendees?: Attendee[];
  }) => {
    if (!problem) {
      toast.error("Please specify a workshop objective");
      return;
    }

    // Clear any previous errors
    setErrorMessage(null);

    await saveWorkshopData({
      problem,
      metrics,
      constraints,
      selectedModel,
      selectedFormat,
      customFormat,
      duration,
      workshopType,
    });
    
    // Also update name if it was changed
    if (workshopId) {
      try {
        await supabase
          .from('workshops')
          .update({ name: workshopName })
          .eq('id', workshopId);
      } catch (error) {
        console.error("Error updating workshop name:", error);
      }
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-workshop-blueprint", {
        body: {
          context: problem,
          objective: problem,
          duration,
          constraints: constraints.join(", "),
          workshopType,
          metrics,
          attendees
        }
      });

      if (error) {
        console.error("Function invoke error:", error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from function");
      }

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      if (data.blueprint) {
        // Transform the blueprint data if needed
        let blueprintData = data.blueprint as Blueprint;
        
        // Handle any field mappings or transformations if needed
        if (blueprintData.materialsList && !blueprintData.materials) {
          blueprintData.materials = blueprintData.materialsList;
        }
        
        if (blueprintData.followupActions && !blueprintData.follow_up) {
          blueprintData.follow_up = blueprintData.followupActions;
        }
        
        if (blueprintData.agenda && !blueprintData.steps) {
          blueprintData.steps = blueprintData.agenda;
        }
        
        setBlueprint(blueprintData);
        await saveGeneratedBlueprint(blueprintData);
        toast.success("Workshop blueprint generated successfully");
        return blueprintData;
      } else {
        throw new Error("No blueprint data received");
      }
    } catch (error) {
      console.error("Error generating blueprint:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to generate workshop blueprint");
      toast.error("Failed to generate workshop blueprint");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    blueprint,
    setBlueprint,
    errorMessage,
    setErrorMessage,
    generateBlueprint
  };
}
