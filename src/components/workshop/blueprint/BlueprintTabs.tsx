
import { Button } from "@/components/ui/button";
import type { Blueprint } from "../types/workshop";

interface BlueprintTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  blueprint: Blueprint | null;
}

export function BlueprintTabs({
  activeTab,
  setActiveTab,
  blueprint
}: BlueprintTabsProps) {
  // Helper function to handle tab changes
  const handleTabChange = (tab: string) => {
    // Only allow switching to blueprint tab if blueprint exists
    if (tab === "blueprint" && !blueprint) {
      return;
    }
    setActiveTab(tab);
  };
  
  return (
    <div className="flex justify-center gap-4 mt-6">
      <Button 
        variant={activeTab === "settings" ? "default" : "outline"}
        onClick={() => handleTabChange("settings")}
      >
        Workshop Setup
      </Button>
      <Button 
        variant={activeTab === "blueprint" ? "default" : "outline"}
        onClick={() => handleTabChange("blueprint")}
        disabled={!blueprint}
      >
        Generated Blueprint
      </Button>
    </div>
  );
}
