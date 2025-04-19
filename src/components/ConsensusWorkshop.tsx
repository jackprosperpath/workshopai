
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftWorkspace } from "@/components/workshop/DraftWorkspace";
import { PromptCanvas } from "@/components/workshop/PromptCanvas";
import { StakeholderSupport } from "@/components/workshop/StakeholderSupport";
import { TeamManagement } from "@/components/workshop/TeamManagement";
import { WorkshopSharing } from "@/components/workshop/WorkshopSharing";

export default function ConsensusWorkshop() {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState("draft");

  useEffect(() => {
    // Set initial tab based on URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash && ['draft', 'prompt', 'stakeholders', 'team', 'share'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="prompt">Prompt Canvas</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>
        <TabsContent value="draft">
          <DraftWorkspace workshopId={workshopId} />
        </TabsContent>
        <TabsContent value="prompt">
          <PromptCanvas workshopId={workshopId} />
        </TabsContent>
        <TabsContent value="stakeholders">
          <StakeholderSupport workshopId={workshopId} />
        </TabsContent>
        <TabsContent value="team">
          <TeamManagement workshopId={workshopId} />
        </TabsContent>
        <TabsContent value="share">
          <WorkshopSharing workshopId={workshopId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
