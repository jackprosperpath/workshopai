
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Blueprint, Attendee } from "@/components/workshop/types/workshop";

interface UseBlueprintProcessorProps {
  workshopId: string | null;
  formState: {
    workshopName: string;
    problem: string;
    metrics: string[];
    duration: number;
    workshopType: 'online' | 'in-person';
    attendees?: Attendee[];
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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<Blueprint | null>(null);

  const generateWorkshopBlueprint = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not authenticated:", userError);
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a workshop.",
          variant: "destructive",
        });
        throw new Error("User not authenticated. Cannot create workshop.");
      }
      const ownerId = user.id;

      // First, create or update the workshop record
      let workshopDbId = workshopId;
      
      if (!workshopDbId) {
        // Create a new workshop record
        const { data: newWorkshop, error: createError } = await supabase
          .from('workshops')
          .insert({
            name: formState.workshopName || 'Untitled Workshop',
            problem: formState.problem,
            metrics: formState.metrics,
            duration: formState.duration,
            workshop_type: formState.workshopType,
            share_id: Math.random().toString(36).substring(2, 8),
            owner_id: ownerId, // Added owner_id
          })
          .select('id')
          .single();
          
        if (createError) {
          console.error("Error creating workshop:", createError);
          throw new Error(`Failed to create workshop record: ${createError.message}`);
        }
        
        workshopDbId = newWorkshop.id;
        setParentWorkshopId(workshopDbId);
      }
      
      // Call the generate-workshop-blueprint edge function
      const { data, error } = await supabase
        .functions
        .invoke('generate-workshop-blueprint', {
          body: {
            context: formState.problem,
            objective: formState.problem,
            duration: formState.duration,
            workshopType: formState.workshopType,
            metrics: formState.metrics,
            attendees: formState.attendees || [],
          }
        });

      if (error) throw error;
      
      if (!data || !data.blueprint) {
        throw new Error("Invalid response from blueprint generator");
      }
      
      console.log("Generated blueprint:", data.blueprint);
      const generatedBp = data.blueprint as Blueprint;
      
      // Update the workshop record with the generated blueprint
      const { error: updateError } = await supabase
        .from('workshops')
        .update({
          generated_blueprint: generatedBp,
          updated_at: new Date().toISOString()
        })
        .eq('id', workshopDbId);

      if (updateError) {
        console.error("Error updating workshop with blueprint:", updateError);
        throw new Error("Failed to save generated blueprint.");
      }
      
      // Update local state
      setGeneratedBlueprint(generatedBp);
      setParentBlueprint(generatedBp);
      setActiveTab("blueprint");
      
      toast({
        title: "Blueprint Generated!",
        description: "Your workshop blueprint has been created successfully.",
      });
      
    } catch (err: any) {
      console.error("Blueprint generation error:", err);
      setErrorMessage(err.message || "Failed to generate workshop blueprint");
      toast({
        title: "Blueprint Generation Failed",
        description: err.message || "Failed to generate workshop blueprint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    workshopId, 
    formState, 
    setParentBlueprint, 
    setParentWorkshopId,
    setActiveTab
  ]);

  const saveWorkshopSettings = useCallback(async () => {
    if (!workshopId) return;
    
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
          updated_at: new Date().toISOString()
        })
        .eq('id', workshopId);

      if (error) throw error;
      
      toast({
        title: "Workshop Updated",
        description: "Your workshop settings have been saved.",
      });
      
    } catch (err: any) {
      console.error("Workshop update error:", err);
      setErrorMessage(err.message || "Failed to update workshop settings");
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update workshop settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [workshopId, formState]);

  return {
    loading,
    errorMessage,
    generateWorkshopBlueprint,
    saveWorkshopSettings,
    generatedBlueprint,
  };
}
