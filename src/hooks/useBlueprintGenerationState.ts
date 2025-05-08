
import { useState, useEffect } from "react";
import type { Blueprint } from "@/components/workshop/types/workshop";

interface UseBlueprintGenerationStateProps {
  onBlueprintGenerated?: (blueprint: Blueprint | null) => void;
}

export function useBlueprintGenerationState({ onBlueprintGenerated }: UseBlueprintGenerationStateProps) {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  
  // Pass blueprint data to parent component if callback provided
  useEffect(() => {
    if (onBlueprintGenerated && blueprint) {
      onBlueprintGenerated(blueprint);
    }
  }, [blueprint, onBlueprintGenerated]);

  // Handler for blueprint updates
  const handleBlueprintUpdate = async (updatedBlueprint: Blueprint, saveFunction: (blueprint: Blueprint) => Promise<void>) => {
    try {
      await saveFunction(updatedBlueprint);
      setBlueprint(updatedBlueprint);
      
      if (onBlueprintGenerated) {
        onBlueprintGenerated(updatedBlueprint);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating blueprint:", error);
      return Promise.reject(error);
    }
  };

  return {
    blueprint,
    setBlueprint,
    handleBlueprintUpdate
  };
}
