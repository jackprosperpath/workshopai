
import { useEffect } from "react";
import type { Blueprint } from "@/components/workshop/types/workshop";

export function useBlueprintSynchronization(
  generatedBlueprint: Blueprint | null,
  currentBlueprint: Blueprint | null,
  setBlueprint: (blueprint: Blueprint) => void,
  onBlueprintGenerated?: (blueprint: Blueprint | null) => void
) {
  // Sync the blueprint from generation to our local state
  useEffect(() => {
    if (generatedBlueprint && generatedBlueprint !== currentBlueprint) {
      setBlueprint(generatedBlueprint);
      
      // Also update parent component if callback provided
      if (onBlueprintGenerated) {
        onBlueprintGenerated(generatedBlueprint);
      }
    }
  }, [generatedBlueprint, currentBlueprint, setBlueprint, onBlueprintGenerated]);
}
