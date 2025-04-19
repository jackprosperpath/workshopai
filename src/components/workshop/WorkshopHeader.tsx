import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

type WorkshopHeaderProps = {
  workshopId: string | null;
  initialName?: string;
};

export function WorkshopHeader({ workshopId, initialName = "Untitled Workshop" }: WorkshopHeaderProps) {
  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialName) {
      setName(initialName);
    }
  }, [initialName]);

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
      toast.success("Workshop name updated");
    } catch (error) {
      console.error("Error updating workshop name:", error);
      toast.error("Failed to update workshop name");
    } finally {
      setIsSaving(false);
    }
  };

  const createNewWorkshop = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Please sign in to create a workshop");
        return;
      }

      const { data: workshop, error } = await supabase
        .from('workshops')
        .insert([{
          owner_id: userData.user.id,
          share_id: crypto.randomUUID().substring(0, 8),
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("New workshop created");
      navigate(`/workshop?id=${workshop.id}`);
    } catch (error) {
      console.error("Error creating workshop:", error);
      toast.error("Failed to create workshop");
    }
  };

  return (
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
      <Button onClick={createNewWorkshop} variant="outline" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        New Workshop
      </Button>
    </div>
  );
}
