
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Blueprint, BlueprintStep } from "@/components/workshop/types/workshop";
// Updated import path for ConciseBlueprint
import type { ConciseBlueprint } from "../../../supabase/functions/process-calendar-invite/types/workshop"; 


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
        
        console.log("Fetching blueprint for ID/ShareID:", workshopId);
        
        // First try to find workshop by ID (UUID)
        let workshopData = null;
        let fetchedById = false;

        // Check if workshopId is a UUID
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (uuidRegex.test(workshopId)) {
          const { data: workshopById, error: workshopByIdError } = await supabase
            .from('workshops')
            .select('id, generated_blueprint, name, share_id')
            .eq('id', workshopId)
            .maybeSingle();
          if (!workshopByIdError && workshopById) {
            console.log("Found workshop by ID:", workshopById);
            workshopData = workshopById;
            fetchedById = true;
          } else if (workshopByIdError) {
            console.warn("Error fetching workshop by ID:", workshopByIdError.message);
          }
        }
          
        // If not found by ID, or workshopId is not a UUID, try share_id
        if (!workshopData) {
          const { data: workshopByShareId, error: workshopByShareIdError } = await supabase
            .from('workshops')
            .select('id, generated_blueprint, name, share_id')
            .eq('share_id', workshopId)
            .maybeSingle();
            
          if (!workshopByShareIdError && workshopByShareId) {
            console.log("Found workshop by share_id:", workshopByShareId);
            workshopData = workshopByShareId;
          } else if (workshopByShareIdError) {
            console.warn("Error fetching workshop by share_id:", workshopByShareIdError.message);
          }
        }
        
        if (workshopData && workshopData.generated_blueprint) {
          console.log("Processing blueprint from 'workshops' table.");
          const blueprintDataFromWorkshop = workshopData.generated_blueprint as unknown as Blueprint; // Assume it's already a full Blueprint
          if (!blueprintDataFromWorkshop.attendees) {
            blueprintDataFromWorkshop.attendees = [];
          }
          if (blueprintDataFromWorkshop.steps) {
            blueprintDataFromWorkshop.steps = blueprintDataFromWorkshop.steps.map(step => ({
              ...step,
              facilitation_notes: step.facilitation_notes || "",
              description: step.description || "",
              materials: step.materials || [],
              duration: step.duration || "0",
            }));
          }
          setBlueprint(blueprintDataFromWorkshop);
          setIsLoading(false);
          return;
        }
        
        // If not found in workshops, try generated_blueprints (concise blueprints usually live here initially)
        console.log("Trying to find in generated_blueprints by share_id:", workshopId);
        const { data: blueprintRecord, error: blueprintError } = await supabase
          .from('generated_blueprints')
          .select('blueprint_data, share_id')
          .eq('share_id', workshopId)
          .maybeSingle();

        if (!blueprintError && blueprintRecord && blueprintRecord.blueprint_data) {
          console.log("Found blueprint in generated_blueprints:", blueprintRecord);
          const conciseBp = blueprintRecord.blueprint_data as unknown as ConciseBlueprint;
          
          // Transform ConciseBlueprint to full Blueprint
          const fullBlueprint: Blueprint = {
            title: conciseBp.workshopTitle,
            description: conciseBp.meetingContext || "",
            objective: conciseBp.objectives.join(SemicolonSpace()),
            steps: conciseBp.agendaItems.map(item => {
              const timelineEntry = conciseBp.basicTimeline.find(t => t.activity === item.name);
              // Extract first number from durationEstimate, default to 15 if not found/parsable
              const durationValue = timelineEntry?.durationEstimate?.match(/\d+/)?.[0];
              const durationStr = durationValue || "15";
              
              return {
                name: item.name,
                description: item.details || "", 
                duration: durationStr,
                materials: [], // Not typically detailed in concise format
                facilitation_notes: `Method: ${item.method || "N/A"} (${item.methodExplanation || "N/A"})\nTip: ${item.tip || "N/A"}`,
              };
            }),
            attendees: conciseBp.attendeesList ? conciseBp.attendeesList.map(nameOrEmail => ({
              name: nameOrEmail, // Use the string as name
              email: nameOrEmail.includes('@') ? nameOrEmail : "", // If it looks like an email, use it
              role: "Attendee" 
            })) : [],
            materials: [], // Not typically detailed in concise format
          };
          setBlueprint(fullBlueprint);
        } else {
          if (fetchedById && !workshopData?.generated_blueprint) {
             console.log("Workshop found by ID, but no generated_blueprint field yet. It might be a new workshop.");
             setBlueprint(null); // Explicitly set to null, frontend should handle this state
          } else {
            console.log("No blueprint found for ID/ShareID:", workshopId);
            if (blueprintError) console.error("Error fetching from generated_blueprints:", blueprintError);
            setBlueprint(null);
            // Only set error if it's not just "not found" for a new workshop
            if (blueprintError && blueprintError.code !== 'PGRST116') { // PGRST116 is "Searched for range but found no rows"
                setError(blueprintError);
            } else if (!workshopData && !blueprintRecord) {
                setError(new Error("Blueprint not found. The ID or share link may be invalid or the blueprint has not been generated yet."));
            }
          }
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
