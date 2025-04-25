
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
  return (
    <div className="flex justify-center gap-4 mt-6">
      <Button 
        variant={activeTab === "settings" ? "default" : "outline"}
        onClick={() => setActiveTab("settings")}
      >
        Workshop Setup
      </Button>
      <Button 
        variant={activeTab === "blueprint" ? "default" : "outline"}
        onClick={() => setActiveTab("blueprint")}
        disabled={!blueprint}
      >
        Generated Blueprint
      </Button>
    </div>
  );
}
