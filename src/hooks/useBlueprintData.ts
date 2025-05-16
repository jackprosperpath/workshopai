
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Blueprint } from "@/components/workshop/types/workshop";
import type { ConciseBlueprint } from "@/types/blueprint";

export function useBlueprintData(workshopId: string) {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchBlueprintData() {
      if (!workshopId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isValidUuid = uuidRegex.test(workshopId);
        
        // First try to get workshop by ID or share_id
        let workshopData = null;
        
        if (isValidUuid) {
          // Try direct UUID lookup first
          const { data: workshopById, error: workshopByIdError } = await supabase
            .from('workshops')
            .select('id, generated_blueprint, name')
            .eq('id', workshopId)
            .maybeSingle();
            
          if (!workshopByIdError && workshopById) {
            workshopData = workshopById;
          }
        }
        
        // If no workshop found by ID or it's not a UUID, try share_id lookup
        if (!workshopData) {
          const { data: workshopByShareId, error: workshopByShareIdError } = await supabase
            .from('workshops')
            .select('id, generated_blueprint, name')
            .eq('share_id', workshopId)
            .maybeSingle();
            
          if (!workshopByShareIdError && workshopByShareId) {
            workshopData = workshopByShareId;
          }
        }
        
        // If still no workshop, try looking in generated_blueprints table
        if (!workshopData) {
          const { data: blueprintData, error: blueprintError } = await supabase
            .from('generated_blueprints')
            .select('blueprint_data')
            .eq('share_id', workshopId)
            .maybeSingle();
            
          if (!blueprintError && blueprintData && blueprintData.blueprint_data) {
            // Convert concise blueprint to full blueprint format
            const conciseBp = blueprintData.blueprint_data as ConciseBlueprint;
            
            // Create a blueprint from the concise data
            const fullBlueprint: Blueprint = {
              title: conciseBp.workshopTitle,
              description: conciseBp.meetingContext || "",
              objectives: conciseBp.objectives,
              agenda: conciseBp.agendaItems,
              attendees: conciseBp.attendeesList ? conciseBp.attendeesList.map(name => ({
                name,
                email: "",
                role: "Attendee"
              })) : [],
              steps: conciseBp.basicTimeline.map(step => ({
                name: step.activity,
                description: "",
                duration: parseInt(step.durationEstimate) || 5,
                materials: []
              })),
              materials: []
            };
            
            setBlueprint(fullBlueprint);
            setIsLoading(false);
            return;
          }
        }
        
        // Process workshop data if found
        if (workshopData && workshopData.generated_blueprint) {
          // Add attendees property if not exists
          const blueprintData = workshopData.generated_blueprint as Blueprint;
          // Ensure the blueprint has an attendees property (even if empty)
          if (!blueprintData.attendees) {
            blueprintData.attendees = [];
          }
          
          setBlueprint(blueprintData);
        } else {
          // No blueprint found
          setBlueprint(null);
        }
      } catch (err: any) {
        console.error("Error fetching blueprint data:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlueprintData();
  }, [workshopId]);

  return { blueprint, isLoading, error };
}
