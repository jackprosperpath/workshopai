
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWorkshopSettings = (workshopId: string | null) => {
  const [workshopName, setWorkshopName] = useState<string>("Untitled Workshop");
  const [duration, setDuration] = useState<number>(120); // Default 2 hours
  const [workshopType, setWorkshopType] = useState<'online' | 'in-person'>('online');
  const [isFromCalendar, setIsFromCalendar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchWorkshopSettings = async () => {
      if (!workshopId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('workshops')
          .select('name, duration, workshop_type, invitation_source_id')
          .eq('id', workshopId)
          .single();

        if (error) {
          console.error("Error fetching workshop settings:", error);
          return;
        }

        if (data) {
          if (data.name) setWorkshopName(data.name);
          if (data.duration) setDuration(data.duration);
          if (data.workshop_type) setWorkshopType(data.workshop_type as 'online' | 'in-person');
          setIsFromCalendar(!!data.invitation_source_id);
        }
      } catch (error) {
        console.error("Error in fetchWorkshopSettings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshopSettings();
  }, [workshopId]);

  return {
    isFromCalendar,
    workshopName,
    setWorkshopName,
    duration,
    setDuration,
    workshopType,
    setWorkshopType,
    loading,
  };
};
