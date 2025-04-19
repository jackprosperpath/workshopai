
import { useState } from "react";
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

  const handleSave = async () => {
    if (!workshopId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('workshops')
        .update({ name })
        .eq('id', workshopId);

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
