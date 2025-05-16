
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast"; // Using ui/toast as in BlueprintGenerator
import type { Blueprint, Attendee } from "@/components/workshop/types/workshop";

interface UseBlueprintProcessorProps {
  workshopId: string | null;
  formState: { // Current values of form fields
    workshopName: string;
    problem: string;
    metrics: string[];
    duration: number;
    workshopType: 'online' | 'in-person';
    attendees: Attendee[];
  };
  setParentBlueprint: (blueprint: Blueprint | null) => void;
  setParentWorkshopId: (id: string | null) => void;
  setActiveTab: (tab: "settings" | "blueprint") => void;
}

export function useBlueprintProcessor({
  workshopId,
  formState,
  setParentBlueprint,
  setParentWorkshopId,
  setActiveTab,
}: UseBlueprintProcessorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateWorkshopBlueprint = async () => {
    if (!formState.problem) {
      toast({ title: "Objective Missing", description: "Please specify a workshop objective.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await supabase.functions.invoke("generate-workshop-blueprint", {
        body: {
          workshopId: workshopId, // workshopId can be null if creating a new one
          name: formState.workshopName,
          problem: formState.problem,
          metrics: formState.metrics,
          duration: formState.duration,
          workshop_type: formState.workshopType,
          attendees: formState.attendees.map(a => ({ email: a.email, role: a.role })),
        },
      });

      if (response.error) throw response.error;
      if (!response.data) throw new Error("No data returned from blueprint generation.");
      
      if (response.data.workshopId && !workshopId) {
        setParentWorkshopId(response.data.workshopId);
      }

      const newBlueprint = response.data.blueprint as Blueprint;
      setParentBlueprint(newBlueprint);
      toast({ title: "Blueprint Generated!", description: "Your Instant AI Meeting Blueprint is ready." });
      setActiveTab("blueprint");
    } catch (error: any) {
      console.error("Error generating blueprint:", error);
      setErrorMessage(error.message || "Failed to generate blueprint. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Could not generate blueprint.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWorkshopSettings = async () => {
    if (!workshopId) {
      toast({ title: "Error", description: "Blueprint ID is missing.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase
        .from('workshops')
        .update({
          name: formState.workshopName,
          problem: formState.problem,
          metrics: formState.metrics,
          duration: formState.duration,
          workshop_type: formState.workshopType,
          // attendees are typically part of generated_blueprint or managed separately
        })
        .eq('id', workshopId);

      if (error) throw error;

      toast({ title: "Settings Saved", description: "Blueprint settings have been updated." });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setErrorMessage(error.message || "Failed to save settings.");
      toast({
        title: "Error",
        description: error.message || "Could not save settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    generateWorkshopBlueprint,
    saveWorkshopSettings,
    loading, // Renamed from processingLoading for clarity
    errorMessage, // Renamed from processingError
  };
}
