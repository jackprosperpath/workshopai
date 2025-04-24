
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
      {workshopId && (
        <Button onClick={onSaveWorkshop} disabled={isSaving} variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Workshop"}
        </Button>
      )}
      <Button onClick={handleCreateNewWorkshop} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        New Workshop
      </Button>
    </div>
  );
}
