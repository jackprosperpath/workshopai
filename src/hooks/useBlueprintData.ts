
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Blueprint, BlueprintStep } from "@/components/workshop/types/workshop";
import type { ConciseBlueprint } from "@/types/blueprint";

export function useBlueprintData(workshopId: string) {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchBlueprintData() {
      if (!workshopId) {
        setIsLoading(false);
        setBlueprint(null); // Ensure blueprint is null if no workshopId
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching blueprint for ID:", workshopId);
        
        // First try to find workshop by ID without UUID validation
        // This allows short share_ids to work
        const { data: workshopById, error: workshopByIdError } = await supabase
          .from('workshops')
          .select('id, generated_blueprint, name, share_id')
          .eq('id', workshopId)
          .maybeSingle();
          
        if (!workshopByIdError && workshopById) {
          console.log("Found workshop by ID:", workshopById);
          if (workshopById.generated_blueprint) {
            const blueprintData = workshopById.generated_blueprint as unknown as Blueprint;
            if (!blueprintData.attendees) {
              blueprintData.attendees = [];
            }
            // Ensure steps have facilitation_notes
            if (blueprintData.steps) {
              blueprintData.steps = blueprintData.steps.map(step => ({
                ...step,
                facilitation_notes: step.facilitation_notes || "",
              }));
            }
            setBlueprint(blueprintData);
            setIsLoading(false);
            return;
          }
        }
        
        // If not found by ID, try share_id
        const { data: workshopByShareId, error: workshopByShareIdError } = await supabase
          .from('workshops')
          .select('id, generated_blueprint, name, share_id')
          .eq('share_id', workshopId)
          .maybeSingle();
          
        if (!workshopByShareIdError && workshopByShareId) {
          console.log("Found workshop by share_id:", workshopByShareId);
          if (workshopByShareId.generated_blueprint) {
            const blueprintData = workshopByShareId.generated_blueprint as unknown as Blueprint;
            if (!blueprintData.attendees) {
              blueprintData.attendees = [];
            }
            // Ensure steps have facilitation_notes
            if (blueprintData.steps) {
              blueprintData.steps = blueprintData.steps.map(step => ({
                ...step,
                facilitation_notes: step.facilitation_notes || "",
              }));
            }
            setBlueprint(blueprintData);
            setIsLoading(false);
            return;
          }
        }
        
        // If not found in workshops, try generated_blueprints
        console.log("Trying to find in generated_blueprints by share_id:", workshopId);
        const { data: blueprintRecord, error: blueprintError } = await supabase
          .from('generated_blueprints')
          .select('blueprint_data, share_id')
          .eq('share_id', workshopId)
          .maybeSingle();

        if (!blueprintError && blueprintRecord && blueprintRecord.blueprint_data) {
          console.log("Found blueprint in generated_blueprints:", blueprintRecord);
          const conciseBp = blueprintRecord.blueprint_data as unknown as ConciseBlueprint;
          const fullBlueprint: Blueprint = {
            title: conciseBp.workshopTitle,
            description: conciseBp.meetingContext || "",
            objective: conciseBp.objectives.join(SemicolonSpace()),
            steps: conciseBp.basicTimeline.map(step => ({
              name: step.activity,
              description: "", 
              duration: (parseInt(step.durationEstimate) || 0).toString(), 
              materials: [], 
              facilitation_notes: "",
            })),
            attendees: conciseBp.attendeesList ? conciseBp.attendeesList.map(name => ({
              name, 
              email: "", 
              role: "Attendee" 
            })) : [],
            materials: [], 
          };
          setBlueprint(fullBlueprint);
        } else {
          console.log("No blueprint found for ID:", workshopId);
          console.error("Blueprint fetch error:", blueprintError);
          setBlueprint(null);
          if (blueprintError) setError(blueprintError);
        }
      } catch (err: any) {
        console.error("Error fetching blueprint data:", err);
        setError(err);
        setBlueprint(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlueprintData();
  }, [workshopId]);

  return { blueprint, isLoading, error };
}

// Helper for joining objectives, can be moved to a utils file
const SemicolonSpace = () => "; ";
