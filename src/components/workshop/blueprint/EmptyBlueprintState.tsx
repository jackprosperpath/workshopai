
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyBlueprintStateProps {
  onNavigateToSettings: () => void;
}

export function EmptyBlueprintState({ onNavigateToSettings }: EmptyBlueprintStateProps) {
  return (
    <Card>
      <CardContent className="p-8 flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium text-center">No Blueprint Generated Yet</h3>
        <p className="text-muted-foreground text-center mt-2 max-w-md">
          Configure your blueprint settings, then click "Generate Blueprint" to create your meeting plan.
        </p>
        <Button 
          variant="outline" 
          onClick={onNavigateToSettings} 
          className="mt-4"
        >
          Go to Blueprint Setup
        </Button>
      </CardContent>
    </Card>
  );
}

