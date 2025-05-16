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
        
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isValidUuid = uuidRegex.test(workshopId);
        
        let workshopData = null;
        
        if (isValidUuid) {
          const { data: workshopById, error: workshopByIdError } = await supabase
            .from('workshops')
            .select('id, generated_blueprint, name, share_id')
            .eq('id', workshopId)
            .maybeSingle();
            
          if (!workshopByIdError && workshopById) {
            workshopData = workshopById;
          }
        }
        
        if (!workshopData) {
          const { data: workshopByShareId, error: workshopByShareIdError } = await supabase
            .from('workshops')
            .select('id, generated_blueprint, name, share_id')
            .eq('share_id', workshopId)
            .maybeSingle();
            
          if (!workshopByShareIdError && workshopByShareId) {
            workshopData = workshopByShareId;
          }
        }
        
        if (workshopData && workshopData.generated_blueprint) {
          const blueprintData = workshopData.generated_blueprint as unknown as Blueprint;
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
        } else if (!workshopData) { // If workshopData is still null, try generated_blueprints
          const { data: blueprintRecord, error: blueprintError } = await supabase
            .from('generated_blueprints')
            .select('blueprint_data, share_id')
            .eq('share_id', workshopId) // Use workshopId which might be a share_id
            .maybeSingle();

          if (!blueprintError && blueprintRecord && blueprintRecord.blueprint_data) {
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
            setBlueprint(null); // No blueprint found
            if (blueprintError) setError(blueprintError);
          }
        } else {
           setBlueprint(null); // No blueprint in workshopData
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
