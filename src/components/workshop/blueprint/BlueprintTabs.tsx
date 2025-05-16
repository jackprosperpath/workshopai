
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, FileText } from "lucide-react";
import type { Blueprint } from "../types/workshop";

interface BlueprintTabsProps {
  activeTab: "settings" | "blueprint";
  setActiveTab: (tab: "settings" | "blueprint") => void;
  blueprint: Blueprint | null;
}

export function BlueprintTabs({ activeTab, setActiveTab, blueprint }: BlueprintTabsProps) {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => setActiveTab(value as "settings" | "blueprint")}
      className="w-full mt-4"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="settings" className="flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Workshop Settings
        </TabsTrigger>
        <TabsTrigger 
          value="blueprint" 
          className="flex items-center"
          disabled={!blueprint}
        >
          <FileText className="w-4 h-4 mr-2" />
          Generated Blueprint
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
