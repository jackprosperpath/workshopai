
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlueprintGenerator } from "./workshop/BlueprintGenerator";
import { WhiteboardTab } from "./workshop/whiteboard/WhiteboardTab";
import type { Blueprint } from "./workshop/types/workshop";

export default function ConsensusWorkshop() {
  const [activeTab, setActiveTab] = useState("workshop");
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && (hash === 'workshop' || hash === 'whiteboard')) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  const handleBlueprintGenerated = (generatedBlueprint: Blueprint) => {
    console.log("Blueprint generated:", generatedBlueprint);
    setBlueprint(generatedBlueprint);
  };

  return (
    <div className="w-full h-full space-y-4 relative">
      <div className="flex-1">
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="workshop">Workshop Design</TabsTrigger>
            <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
          </TabsList>
          <TabsContent value="workshop">
            <BlueprintGenerator 
              workshopIdParam={workshopId} 
              onBlueprintGenerated={handleBlueprintGenerated}
            />
          </TabsContent>
          <TabsContent value="whiteboard">
            <WhiteboardTab blueprint={blueprint} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
