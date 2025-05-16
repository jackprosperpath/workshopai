
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlueprintGenerator } from "./workshop/BlueprintGenerator";

export default function ConsensusWorkshop() {
  const [activeTab, setActiveTab] = useState("workshop");
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const [blueprint, setBlueprint] = useState<any>(null);
  
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash === 'workshop') {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  return (
    <div className="w-full h-full space-y-4 relative">
      <div className="flex-1">
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="workshop">Workshop Design</TabsTrigger>
          </TabsList>
          <TabsContent value="workshop">
            <BlueprintGenerator 
              workshopIdParam={workshopId} 
              onBlueprintGenerated={setBlueprint}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
