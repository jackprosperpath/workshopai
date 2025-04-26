
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import ConsensusWorkshop from "@/components/ConsensusWorkshop";
import { WorkshopHistory } from "@/components/workshop/WorkshopHistory";
import { useWorkshop } from "@/hooks/useWorkshop";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Save } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const Workshop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const { loading, workshopName, getWorkshop, createWorkshop, updateWorkshopName } = useWorkshop();
  const [workshops, setWorkshops] = useState([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast.error("Authentication error. Please sign in again.");
        navigate("/auth");
      } finally {
        setIsAuthenticating(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticating) return;

    if (workshopId) {
      getWorkshop(workshopId);
    } else {
      fetchWorkshops();
    }
  }, [workshopId, isAuthenticating]);

  useEffect(() => {
    if (workshopName) {
      setName(workshopName);
    }
  }, [workshopName]);

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
      
      console.log('Fetched workshops:', data);
      setWorkshops(data || []);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      toast.error("Failed to load workshops");
    } finally {
      setIsLoadingWorkshops(false);
    }
  };

  const handleSave = async () => {
    if (!workshopId || !name.trim()) return;
    
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

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Authenticating...</span>
      </div>
    );
  }

  if (loading && workshopId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading workshop...</span>
        </div>
      </div>
    );
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
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex justify-end gap-2">
                <Button onClick={createWorkshop} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Workshop
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Workshop"}
                </Button>
              </div>
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
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") setIsEditing(false);
                      }}
                      autoFocus
                    />
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                ) : (
                  <h1
                    className="text-2xl font-semibold cursor-pointer hover:bg-accent hover:text-accent-foreground rounded px-2 py-1 transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    {name || "Untitled Workshop"}
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
