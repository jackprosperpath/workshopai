import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftWorkspace } from "@/components/workshop/DraftWorkspace";
import { PromptCanvas } from "@/components/workshop/PromptCanvas";
import { StakeholderSupport } from "@/components/workshop/StakeholderSupport";
import { TeamManagement } from "@/components/workshop/TeamManagement";
import { WorkshopSharing } from "@/components/workshop/WorkshopSharing";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
import { useStakeholders } from "@/hooks/useStakeholders";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export default function ConsensusWorkshop() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workshopId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    problem,
    setProblem,
    metrics,
    setMetrics,
    metricInput,
    setMetricInput,
    constraints,
    setConstraints,
    constraintInput,
    setConstraintInput,
    selectedFormat,
    updateFormat,
    customFormat,
    setCustomFormat,
    addMetric,
    addConstraint,
  } = usePromptCanvas();
  
  const {
    currentDraft,
    versions,
    currentIdx,
    setCurrentIdx,
    activeThread,
    setActiveThread,
    addFeedback,
    generateDraft
  } = useDraftWorkspace();
  
  const {
    stakeholders,
    newRole,
    setNewRole,
    addStakeholder,
    updateStakeholder
  } = useStakeholders();

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['draft', 'prompt', 'stakeholders', 'team', 'share'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  const handleGenerateSolution = async () => {
    setLoading(true);
    try {
      await generateDraft(
        problem, 
        metrics, 
        constraints, 
        selectedFormat
      );
    } catch (error) {
      console.error("Error generating solution:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkshop = async () => {
    if (!workshopId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('workshops')
        .update({
          problem,
          metrics,
          constraints,
          selected_model: selectedModel,
          updated_at: new Date().toISOString()
        })
        .eq('id', workshopId);

      if (error) throw error;
      toast.success("Workshop saved successfully");
    } catch (error) {
      console.error("Error saving workshop:", error);
      toast.error("Failed to save workshop");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewWorkshop = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast.error("Please sign in to create a workshop");
        return;
      }

      const { data: workshop, error } = await supabase
        .from('workshops')
        .insert([{
          owner_id: userData.user.id,
          share_id: crypto.randomUUID().substring(0, 8),
          name: "Untitled Workshop"
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("New workshop created");
      navigate(`/workshop?id=${workshop.id}`);
    } catch (error) {
      console.error("Error creating workshop:", error);
      toast.error("Failed to create workshop");
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={handleCreateNewWorkshop} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Workshop
        </Button>
        <Button 
          onClick={handleSaveWorkshop} 
          disabled={!workshopId || isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Workshop"}
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="prompt">Topic</TabsTrigger>
          <TabsTrigger value="draft">Solution Canvas</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>
        <TabsContent value="team">
          <TeamManagement />
        </TabsContent>
        <TabsContent value="prompt">
          <PromptCanvas 
            problem={problem}
            setProblem={setProblem}
            metrics={metrics}
            metricInput={metricInput}
            setMetricInput={setMetricInput}
            addMetric={addMetric}
            constraints={constraints}
            constraintInput={constraintInput}
            setConstraintInput={setConstraintInput}
            addConstraint={addConstraint}
            selectedFormat={selectedFormat}
            updateFormat={updateFormat}
            customFormat={customFormat}
            setCustomFormat={setCustomFormat}
            onGenerate={handleGenerateSolution}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="draft">
          <DraftWorkspace 
            currentDraft={currentDraft}
            versions={versions}
            currentIdx={currentIdx}
            setCurrentIdx={setCurrentIdx}
            activeThread={activeThread}
            setActiveThread={setActiveThread}
            addFeedback={addFeedback}
            onRePrompt={handleGenerateSolution}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="stakeholders">
          <StakeholderSupport 
            stakeholders={stakeholders}
            newRole={newRole}
            setNewRole={setNewRole}
            addStakeholder={addStakeholder}
            updateStakeholder={updateStakeholder}
          />
        </TabsContent>
        <TabsContent value="share">
          <WorkshopSharing 
            workshopData={{
              problem,
              metrics,
              constraints,
              selectedModel
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
