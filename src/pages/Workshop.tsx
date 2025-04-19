
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ConsensusWorkshop from "@/components/ConsensusWorkshop";
import { WorkshopHeader } from "@/components/workshop/WorkshopHeader";
import { useWorkshop } from "@/hooks/useWorkshop";
import { supabase } from "@/integrations/supabase/client";

const Workshop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const { loading, workshopName, createWorkshop, getWorkshop } = useWorkshop();

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
    }

    return () => subscription.unsubscribe();
  }, [navigate, workshopId]);

  if (loading && workshopId) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        {!workshopId ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <h1 className="text-3xl font-bold mb-4">Welcome to WorkshopAI</h1>
            <p className="text-muted-foreground mb-8">Create a new workshop to get started</p>
            <Button onClick={createWorkshop} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create New Workshop
            </Button>
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
