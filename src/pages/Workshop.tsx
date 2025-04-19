
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import ConsensusWorkshop from "@/components/ConsensusWorkshop";
import { WorkshopHeader } from "@/components/workshop/WorkshopHeader";
import { WorkshopHistory } from "@/components/workshop/WorkshopHistory";
import { useWorkshop } from "@/hooks/useWorkshop";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Workshop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const { loading, workshopName, getWorkshop, createWorkshop, updateWorkshopName } = useWorkshop();
  const [workshops, setWorkshops] = useState([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    if (workshopId) {
      getWorkshop(workshopId);
    } else {
      fetchWorkshops();
    }

    return () => subscription.unsubscribe();
  }, [navigate, workshopId]);

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
        console.error('Error fetching workshops:', error);
        throw error;
      }
      
      console.log('Fetched workshops:', data);
      setWorkshops(data || []);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setIsLoadingWorkshops(false);
    }
  };

  if (loading && workshopId) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        {!workshopId ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Your Workshops</h1>
              <Button onClick={createWorkshop} className="gap-2">
                <Plus className="h-4 w-4" />
                New Workshop
              </Button>
            </div>
            <WorkshopHistory 
              workshops={workshops} 
              isLoading={isLoadingWorkshops} 
            />
          </div>
        ) : (
          <>
            <WorkshopHeader 
              workshopId={workshopId} 
              initialName={workshopName} 
              onNameUpdate={updateWorkshopName}
            />
            <ConsensusWorkshop />
          </>
        )}
      </div>
    </div>
  );
};

export default Workshop;
