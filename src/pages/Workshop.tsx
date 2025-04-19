import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ConsensusWorkshop from "@/components/ConsensusWorkshop";
import { WorkshopHeader } from "@/components/workshop/WorkshopHeader";
import { WorkshopHistory } from "@/components/workshop/WorkshopHistory";
import { useWorkshop } from "@/hooks/useWorkshop";
import { supabase } from "@/integrations/supabase/client";

const Workshop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const { loading, workshopName, createWorkshop, getWorkshop } = useWorkshop();
  const [workshops, setWorkshops] = useState([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Load workshop data if ID is provided
    if (workshopId) {
      getWorkshop(workshopId);
    } else {
      // If no workshop ID, fetch workshop history
      fetchWorkshops();
    }

    return () => subscription.unsubscribe();
  }, [navigate, workshopId]);

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
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
            </div>
            <WorkshopHistory 
              workshops={workshops} 
              isLoading={isLoadingWorkshops} 
            />
          </div>
        ) : (
          <>
            <WorkshopHeader workshopId={workshopId} initialName={workshopName} />
            <ConsensusWorkshop />
          </>
        )}
      </div>
    </div>
  );
};

export default Workshop;
