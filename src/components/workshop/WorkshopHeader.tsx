
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type WorkshopHeaderProps = {
  workshopId: string | null;
  initialName?: string;
};

export function WorkshopHeader({ workshopId, initialName = "Untitled Workshop" }: WorkshopHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    if (initialName) {
      setName(initialName);
    }
  }, [initialName]);

  const handleSave = async () => {
    if (!workshopId) return;
    
    setIsSaving(true);
    try {
      console.log("Updating workshop name for ID:", workshopId);
      
      // Check if workshopId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUuid = uuidRegex.test(workshopId);

      let result;
      if (isValidUuid) {
        // If it's a valid UUID, use it directly
        result = await supabase
          .from('workshops')
          .update({ name })
          .eq('id', workshopId);
      } else {
        // If not a valid UUID, it might be a share_id
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

  return (
    <div className="flex items-center gap-4 mb-6">
      {isEditing ? (
        <div className="flex gap-2 items-center">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-[300px]"
            placeholder="Enter workshop name..."
          />
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
          >
            Save
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <h1 className="text-2xl font-semibold">{name}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}
