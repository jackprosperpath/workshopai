
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
        return;
      }

      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('owner_id', userData.user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      setWorkshops(data || []);
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
        <h1 className="text-3xl font-bold">Your Workshops</h1>
        <Button onClick={onCreateWorkshop} className="gap-2">
          <Plus className="h-4 w-4" />
          New Workshop
        </Button>
      </div>
      <WorkshopHistory
        workshops={workshops}
        isLoading={isLoadingWorkshops}
      />
    </div>
  );
}
