
import { CardTitle, CardDescription } from "@/components/ui/card";

interface BlueprintHeaderProps {
  // currentStep was here, but is no longer needed as per usage in BlueprintGenerator
}

export function BlueprintHeader({}: BlueprintHeaderProps) { // Props can be removed if empty, or kept for future additions
  return (
    <>
      <CardTitle>Create Meeting Blueprint</CardTitle>
      <CardDescription>
        Follow these steps to define your AI-generated meeting blueprint
      </CardDescription>
      {/* The div containing step indicators and step-specific text has been removed */}
    </>
  );
}
