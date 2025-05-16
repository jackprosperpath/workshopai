
import { useEffect } from "react";
import type { Blueprint } from "@/components/workshop/types/workshop";

export function useBlueprintSynchronization(
  generatedBlueprint: Blueprint | null,
  currentBlueprint: Blueprint | null,
  setBlueprint: (blueprint: Blueprint) => void,
  onBlueprintGenerated?: (blueprint: Blueprint) => void
) {
  // Sync the blueprint from generation to our local state
  useEffect(() => {
    if (generatedBlueprint && JSON.stringify(generatedBlueprint) !== JSON.stringify(currentBlueprint)) {
      console.log("Updating blueprint from generation:", generatedBlueprint);
      setBlueprint(generatedBlueprint);
      
      // Also update parent component if callback provided
      if (onBlueprintGenerated) {
        console.log("Calling onBlueprintGenerated with:", generatedBlueprint);
        onBlueprintGenerated(generatedBlueprint);
      }
    }
  }, [generatedBlueprint, currentBlueprint, setBlueprint, onBlueprintGenerated]);
}
