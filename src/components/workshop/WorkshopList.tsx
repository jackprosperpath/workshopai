
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkshopHistory } from "@/components/workshop/WorkshopHistory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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
      const { data: ownedWorkshops, error: ownedError } = await supabase
        .from('workshops')
        .select('*')
        .eq('owner_id', userData.user.id)
        .order('updated_at', { ascending: false });

      if (ownedError) {
        throw ownedError;
      }

      // Then get workshops created from calendar invites with the user's email
      const { data: calendarInvites, error: invitesError } = await supabase
        .from('inbound_invites')
        .select('id, workshop_id, organizer_email, summary, created_at, status')
        .eq('organizer_email', userData.user.email)
        .not('workshop_id', 'is', null)
        .order('created_at', { ascending: false });

      if (invitesError) {
        throw invitesError;
      }

      // Also get standalone blueprints from generated_blueprints table
      const { data: generatedBlueprints, error: blueprintsError } = await supabase
        .from('generated_blueprints')
        .select('id, blueprint_data, share_id, created_at, inbound_invite_id')
        .order('created_at', { ascending: false });
        
      if (blueprintsError) {
        throw blueprintsError;
      }

      // For each calendar invite, fetch the workshop details
      let calendarWorkshops = [];
      if (calendarInvites && calendarInvites.length > 0) {
        const workshopIds = calendarInvites.map(invite => invite.workshop_id);
        
        const { data: inviteWorkshops, error: workshopsError } = await supabase
          .from('workshops')
          .select('*')
          .in('id', workshopIds);
          
        if (workshopsError) {
          throw workshopsError;
        }

        // Annotate calendar workshops with source info
        calendarWorkshops = inviteWorkshops.map(workshop => ({
          ...workshop,
          source: 'calendar'
        }));
      }

      // Convert standalone blueprints to workshop format for unified list
      let standaloneBlueprints = [];
      if (generatedBlueprints && generatedBlueprints.length > 0) {
        standaloneBlueprints = generatedBlueprints
          .filter(bp => bp.blueprint_data && !calendarInvites.some(invite => invite.id === bp.inbound_invite_id))
          .map(bp => {
            const conciseBp = bp.blueprint_data;
            return {
              id: bp.share_id,
              name: conciseBp.workshopTitle || "Untitled Meeting",
              problem: conciseBp.meetingContext || "",
              created_at: bp.created_at,
              updated_at: bp.created_at,
              share_id: bp.share_id,
              source: 'generated_blueprint',
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
                  materials: []
                })) : [],
                materials: []
              }
            };
          });
      }
      
      // Combine all sources of workshops
      const allWorkshops = [...ownedWorkshops];
      
      // Add calendar workshops that don't already exist in owned workshops
      calendarWorkshops.forEach(calendarWorkshop => {
        if (!allWorkshops.some(workshop => workshop.id === calendarWorkshop.id)) {
          allWorkshops.push(calendarWorkshop);
        }
      });
      
      // Add standalone blueprints as workshops
      standaloneBlueprints.forEach(blueprint => {
        if (!allWorkshops.some(workshop => workshop.share_id === blueprint.share_id)) {
          allWorkshops.push(blueprint);
        }
      });
      
      // Sort by updated_at
      allWorkshops.sort((a, b) => 
        new Date(b.updated_at || b.created_at).getTime() - 
        new Date(a.updated_at || a.created_at).getTime()
      );
      
      setWorkshops(allWorkshops);
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
