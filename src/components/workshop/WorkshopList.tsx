import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkshopHistory } from "@/components/workshop/WorkshopHistory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import type { ConciseBlueprint } from "@/types/blueprint";
import type { Blueprint } from "@/components/workshop/types/workshop";

interface WorkshopListProps {
  onCreateWorkshop: () => void;
}

export function WorkshopList({ onCreateWorkshop }: WorkshopListProps) {
  const [workshops, setWorkshops] = useState([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log("No authenticated user found");
        setIsLoadingWorkshops(false);
        return;
      }

      // First get workshops owned by the user
      const { data: ownedWorkshopsResult, error: ownedError } = await supabase
        .from('workshops')
        .select('*')
        .eq('owner_id', userData.user.id)
        .order('updated_at', { ascending: false });

      if (ownedError) {
        throw ownedError;
      }
      const ownedWorkshops = ownedWorkshopsResult || [];


      // Then get workshops created from calendar invites with the user's email
      const { data: calendarInvitesResult, error: invitesError } = await supabase
        .from('inbound_invites')
        .select('id, workshop_id, organizer_email, summary, created_at, status')
        .eq('organizer_email', userData.user.email)
        .not('workshop_id', 'is', null)
        .order('created_at', { ascending: false });

      if (invitesError) {
        throw invitesError;
      }
      const calendarInvites = calendarInvitesResult || [];

      // Also get standalone blueprints from generated_blueprints table
      const { data: generatedBlueprintsResult, error: blueprintsError } = await supabase
        .from('generated_blueprints')
        .select('id, blueprint_data, share_id, created_at, inbound_invite_id')
        .order('created_at', { ascending: false });
        
      if (blueprintsError) {
        throw blueprintsError;
      }
      const generatedBlueprints = generatedBlueprintsResult || [];

      // For each calendar invite, fetch the workshop details
      let calendarWorkshopsData = [];
      if (calendarInvites && calendarInvites.length > 0) {
        const workshopIds = calendarInvites.map(invite => invite.workshop_id).filter(id => id !== null) as string[];
        
        if (workshopIds.length > 0) {
          const { data: inviteWorkshops, error: workshopsError } = await supabase
            .from('workshops')
            .select('*')
            .in('id', workshopIds);
            
          if (workshopsError) {
            throw workshopsError;
          }

          // Annotate calendar workshops with source info
          calendarWorkshopsData = (inviteWorkshops || []).map(workshop => ({
            ...workshop,
            source: 'calendar'
          }));
        }
      }

      // Convert standalone blueprints to workshop format for unified list
      let standaloneBlueprintsData = [];
      if (generatedBlueprints && generatedBlueprints.length > 0) {
        standaloneBlueprintsData = generatedBlueprints
          .filter(bp => bp.blueprint_data && !calendarInvites.some(invite => invite.id === bp.inbound_invite_id))
          .map(bp => {
            const conciseBp = bp.blueprint_data as unknown as ConciseBlueprint;
            return {
              id: bp.share_id, // Use share_id as id for these
              name: conciseBp.workshopTitle || "Untitled Meeting",
              problem: conciseBp.meetingContext || "",
              created_at: bp.created_at,
              updated_at: bp.created_at, // Using created_at as updated_at for consistency
              share_id: bp.share_id,
              owner_id: userData.user?.id || "", // Attempt to assign owner
              source: 'generated_blueprint', // Indicate the source
              // Convert ConciseBlueprint to the full Blueprint structure for workshop list
              generated_blueprint: {
                title: conciseBp.workshopTitle,
                description: conciseBp.meetingContext || "",
                objectives: conciseBp.objectives || [],
                agenda: conciseBp.agendaItems || [],
                attendees: conciseBp.attendeesList ? conciseBp.attendeesList.map(name => ({ name, email: "", role: "Attendee" })) : [],
                steps: conciseBp.basicTimeline ? conciseBp.basicTimeline.map(step => ({
                  name: step.activity,
                  description: "",
                  duration: parseInt(step.durationEstimate) || 5,
                  materials: [],
                  facilitation_notes: ""
                })) : [],
                materials: []
              } as Blueprint // Cast to Blueprint
            };
          });
      }
      
      // Combine all sources of workshops
      const allWorkshops = [...ownedWorkshops];
      
      // Add calendar workshops that don't already exist in owned workshops
      calendarWorkshopsData.forEach(calendarWorkshop => {
        if (!allWorkshops.some(workshop => workshop.id === calendarWorkshop.id)) {
          allWorkshops.push(calendarWorkshop);
        }
      });
      
      // Add standalone blueprints as workshops
      // Ensure share_id is unique if id is already used
      standaloneBlueprintsData.forEach(blueprintWorkshop => {
        if (!allWorkshops.some(ws => ws.id === blueprintWorkshop.id || (ws.share_id && ws.share_id === blueprintWorkshop.share_id))) {
          allWorkshops.push(blueprintWorkshop);
        }
      });
      
      // Sort by updated_at
      allWorkshops.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
          const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
          return dateB - dateA;
        }
      );
      
      setWorkshops(allWorkshops as any); // Use 'as any' temporarily if type issues persist, refine later
    } catch (error) {
      console.error('Error fetching workshops:', error);
      toast.error("Failed to load workshops");
    } finally {
      setIsLoadingWorkshops(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Blueprints</h1>
        <Button onClick={onCreateWorkshop} className="gap-2">
          <Plus className="h-4 w-4" />
          New Blueprint
        </Button>
      </div>
      <WorkshopHistory
        workshops={workshops}
        isLoading={isLoadingWorkshops}
      />
    </div>
  );
}
