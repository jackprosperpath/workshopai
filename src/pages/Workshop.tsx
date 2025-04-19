
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import ConsensusWorkshop from "@/components/ConsensusWorkshop";
import { WorkshopHistory } from "@/components/workshop/WorkshopHistory";
import { useWorkshop } from "@/hooks/useWorkshop";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const Workshop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const { loading, workshopName, getWorkshop, createWorkshop, updateWorkshopName } = useWorkshop();
  const [workshops, setWorkshops] = useState([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workshopName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(workshopName);
  }, [workshopName]);

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

  const handleSave = async () => {
    if (!workshopId) return;
    
    setIsSaving(true);
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUuid = uuidRegex.test(workshopId);

      let result;
      if (isValidUuid) {
        result = await supabase
          .from('workshops')
          .update({ name })
          .eq('id', workshopId);
      } else {
        result = await supabase
          .from('workshops')
          .update({ name })
          .eq('share_id', workshopId);
      }

      const { error } = result;
      if (error) throw error;
      
      setIsEditing(false);
      updateWorkshopName(name);
      toast.success("Workshop name updated");
    } catch (error) {
      console.error("Error updating workshop name:", error);
      toast.error("Failed to update workshop name");
    } finally {
      setIsSaving(false);
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="max-w-[300px]"
                      placeholder="Enter workshop name..."
                      onBlur={handleSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') setIsEditing(false);
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <h1 
                    className="text-2xl font-semibold cursor-pointer hover:bg-accent hover:text-accent-foreground rounded px-2 py-1 transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    {name}
                  </h1>
                )}
              </div>
            </div>
            <ConsensusWorkshop />
          </>
        )}
      </div>
    </div>
  );
};

export default Workshop;
