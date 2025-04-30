
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";
import { useWorkshopActions } from "@/hooks/useWorkshopActions";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";

export function WorkshopActions() {
  const {
    handleCreateNewWorkshop,
    handleSaveWorkshop,
    isSaving,
    workshopId
  } = useWorkshopActions();
  
  const {
    problem,
    metrics,
    constraints,
    selectedModel
  } = usePromptCanvas();
  
  const onSaveWorkshop = () => {
    handleSaveWorkshop(problem, metrics, constraints, selectedModel);
  };
  
  return (
    <div className="flex justify-end gap-2 mb-4">
      {!workshopId ? (
        <Button 
          onClick={handleCreateNewWorkshop}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          New Workshop
        </Button>
      ) : (
        <Button 
          onClick={onSaveWorkshop} 
          disabled={isSaving}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Workshop"}
        </Button>
      )}
    </div>
  );
}
