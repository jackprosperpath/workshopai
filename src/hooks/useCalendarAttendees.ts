
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Attendee } from "@/components/workshop/types/workshop";

export function useCalendarAttendees(workshopId: string | null) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [shouldLoadFromCalendar, setShouldLoadFromCalendar] = useState<boolean>(true);

  // Fetch attendees when workshop ID changes
  useEffect(() => {
    const fetchAttendees = async () => {
      if (!workshopId || !shouldLoadFromCalendar) return;
      
      try {
        // First check if this is from a calendar invite
        const { data: workshop, error: workshopError } = await supabase
          .from('workshops')
          .select('invitation_source_id')
          .eq('id', workshopId)
          .single();
          
        if (workshopError || !workshop || !workshop.invitation_source_id) {
          return; // Not from calendar or error
        }
        
        // Get calendar invite attendees
        const { data: invite, error: inviteError } = await supabase
          .from('inbound_invites')
          .select('attendees')
          .eq('id', workshop.invitation_source_id)
          .single();
          
        if (inviteError || !invite || !invite.attendees) {
          return;
        }
        
        // Format attendees
        const formattedAttendees: Attendee[] = Array.isArray(invite.attendees) ? 
          invite.attendees.map((email: string) => ({
            email,
            role: ""
          })) : [];
          
        // Only update if we have new attendees and they haven't been edited yet
        if (formattedAttendees.length > 0 && 
           (attendees.length === 0 || 
            (attendees.length === 1 && !attendees[0].email))) {
          setAttendees(formattedAttendees);
          // After loading from calendar once, don't reload to avoid overwriting user edits
          setShouldLoadFromCalendar(false);
        }
      } catch (error) {
        console.error("Error fetching attendees:", error);
      }
    };
    
    fetchAttendees();
  }, [workshopId, attendees, shouldLoadFromCalendar]);

  const updateAttendeeRoles = (updatedAttendees: Attendee[]) => {
    setAttendees(updatedAttendees);
    // Once user has explicitly updated attendees, don't reload from calendar
    setShouldLoadFromCalendar(false);
  };

  return {
    attendees,
    updateAttendeeRoles
  };
}
