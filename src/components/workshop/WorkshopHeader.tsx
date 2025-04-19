
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type WorkshopHeaderProps = {
  workshopId: string | null;
  initialName?: string;
  onNameUpdate?: (newName: string) => void;
};

export function WorkshopHeader({ 
  workshopId, 
  initialName = "Untitled Workshop",
  onNameUpdate
}: WorkshopHeaderProps) {
  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      if (onNameUpdate) {
        onNameUpdate(name);
      }
      toast.success("Workshop name updated");
    } catch (error) {
      console.error("Error updating workshop name:", error);
      toast.error("Failed to update workshop name");
    } finally {
      setIsSaving(false);
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
  );
}
