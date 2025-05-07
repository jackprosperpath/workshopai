
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Attendee } from "@/components/workshop/types/workshop";

export function useWorkshopSettings(workshopId: string | null) {
  const [isFromCalendar, setIsFromCalendar] = useState(false);
  const [workshopName, setWorkshopName] = useState("Untitled Workshop");
  const [duration, setDuration] = useState(120);
  const [workshopType, setWorkshopType] = useState<'online' | 'in-person'>('online');
  
  // Check if this workshop was created from a calendar invite
  useEffect(() => {
    async function checkCalendarSource() {
      if (!workshopId) return;

      try {
        const { data, error } = await supabase
          .from('workshops')
          .select(`
            invitation_source_id,
            problem,
            duration,
            workshop_type,
            name
          `)
          .eq('id', workshopId)
          .single();

        if (error) throw error;
        
        if (data) {
          if (data.invitation_source_id) {
            setIsFromCalendar(true);
          }
          
          // Pre-fill form with data from workshop
          if (data.duration) setDuration(data.duration);
          if (data.workshop_type) setWorkshopType(data.workshop_type as 'online' | 'in-person');
          if (data.name) setWorkshopName(data.name);
        }
      } catch (error) {
        console.error("Error checking calendar source:", error);
      }
    }

    checkCalendarSource();
  }, [workshopId]);

  return {
    isFromCalendar,
    workshopName,
    setWorkshopName,
    duration,
    setDuration,
    workshopType,
    setWorkshopType,
  };
}
