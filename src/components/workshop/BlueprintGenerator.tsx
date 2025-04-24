import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { Clock, Users, Calendar, PlusCircle, Minus, Wand, Loader2 } from "lucide-react";
import { ItemList } from "./ItemList";
import { FormatSelector } from "./FormatSelector";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { useWorkshopActions } from "@/hooks/useWorkshopActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUpload } from "./DocumentUpload";
import { AiModel } from "@/hooks/usePromptCanvas";
import { usePromptCanvasSync } from "@/hooks/usePromptCanvasSync";

type Attendee = {
  role: string;
  count: number;
};

type BlueprintAgendaItem = {
  name: string;
  duration: string;
  activity: string;
  description: string;
  prompts: string[];
  materials: string[];
  expectedOutcomes: string[];
  facilitationTips: string[];
};

type Blueprint = {
  title: string;
  duration: string;
  agenda: BlueprintAgendaItem[];
  materialsList: string[];
  followupActions: string[];
};

export function BlueprintGenerator() {
  const {
    problem,
    setProblem,
    metrics,
    setMetrics,
    metricInput,
    setMetricInput,
    addMetric,
    constraints,
    setConstraints,
    constraintInput,
    setConstraintInput,
    addConstraint,
    selectedFormat,
    updateFormat,
    customFormat,
    setCustomFormat,
    selectedModel,
    setSelectedModel,
  } = usePromptCanvas();

  const { syncData } = usePromptCanvasSync(
    { problem, metrics, constraints, selectedModel },
    (data) => {
      if (data.problem !== undefined) setProblem(data.problem);
      if (data.metrics !== undefined) setMetrics(data.metrics);
      if (data.constraints !== undefined) setConstraints(data.constraints);
      if (data.selectedModel !== undefined) setSelectedModel(data.selectedModel);
    }
  );

  const { handleSaveWorkshop } = useWorkshopActions();

  const [duration, setDuration] = useState("120");
  const [attendees, setAttendees] = useState<Attendee[]>([{ role: "", count: 1 }]);
  const [prereads, setPrereads] = useState("");
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [documents, setDocuments] = useState<{ name: string; path: string; size: number; }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("settings");

  const saveWorkshopContext = () => {
    handleSaveWorkshop(problem, metrics, constraints, selectedModel);
    syncData({ problem, metrics, constraints, selectedModel });
  };

  const addAttendeeRole = () => {
    setAttendees([...attendees, { role: "", count: 1 }]);
  };

  const updateAttendee = (index: number, field: keyof Attendee, value: string | number) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  const removeAttendeeRole = (index: number) => {
    if (attendees.length > 1) {
      const newAttendees = [...attendees];
      newAttendees.splice(index, 1);
      setAttendees(newAttendees);
    }
  };

  const generateBlueprint = async () => {
    if (!problem) {
      toast.error("Please specify a workshop scope statement");
      return;
    }

    saveWorkshopContext();

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-workshop-blueprint", {
        body: {
          context: problem,
          objective: problem,
          duration,
          attendees: attendees.filter(a => a.role.trim() !== ""),
          prereads,
          constraints: constraints.join(", ")
        }
      });

      if (error) {
        throw error;
      }

      if (data.blueprint) {
        setBlueprint(data.blueprint);
        toast.success("Workshop blueprint generated successfully");
        setActiveTab("blueprint");
      } else {
        throw new Error("No blueprint data received");
      }
    } catch (error) {
      console.error("Error generating blueprint:", error);
      toast.error("Failed to generate workshop blueprint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Workshop Design</TabsTrigger>
          <TabsTrigger value="blueprint">Generated Blueprint</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Design</CardTitle>
              <CardDescription>Configure the context and settings for your workshop</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="problem">Scope Statement</Label>
                <Textarea
                  id="problem"
                  placeholder="Describe the problem you want to solve..."
                  className="min-h-[100px]"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                />
              </div>

              <ItemList
                label="Success Metrics"
                tooltipText="Define how success will be measured"
                items={metrics}
                inputValue={metricInput}
                setInputValue={setMetricInput}
                onAdd={addMetric}
                placeholder="Add success metric..."
              />

              <ItemList
                label="Constraints"
                tooltipText="List any limitations or requirements"
                items={constraints}
                inputValue={constraintInput}
                setInputValue={setConstraintInput}
                onAdd={addConstraint}
                placeholder="Add constraint..."
              />

              <div className="space-y-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select 
                  value={selectedModel} 
                  onValueChange={(value: AiModel) => setSelectedModel(value)}
                >
                  <SelectTrigger id="ai-model">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o-mini (Fast)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o (Powerful)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Deliverable Format</Label>
                <FormatSelector
                  selectedFormat={selectedFormat}
                  updateFormat={updateFormat}
                  customFormat={customFormat}
                  setCustomFormat={setCustomFormat}
                />
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="duration">Workshop Duration</Label>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="360">Half day (6 hours)</SelectItem>
                    <SelectItem value="480">Full day (8 hours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Attendees</Label>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {attendees.map((attendee, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input 
                      placeholder="Role (e.g., Developer, Manager)" 
                      value={attendee.role}
                      onChange={(e) => updateAttendee(index, "role", e.target.value)}
                      className="flex-1"
                    />
                    <Input 
                      type="number" 
                      min="1"
                      placeholder="Count" 
                      value={attendee.count}
                      onChange={(e) => updateAttendee(index, "count", parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeAttendeeRole(index)}
                      disabled={attendees.length <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addAttendeeRole}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" /> Add Role
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Workshop Documents</Label>
                <DocumentUpload onDocumentsUpdate={setDocuments} />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload any context documents or pre-reads for the workshop
                </p>
              </div>

              <Button 
                onClick={generateBlueprint} 
                disabled={loading || !problem}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Blueprint...
                  </>
                ) : (
                  <>
                    <Wand className="mr-2 h-4 w-4" />
                    Generate Workshop Blueprint
                  </>
                )}
              </Button>

              <Button 
                onClick={saveWorkshopContext} 
                variant="outline" 
                className="w-full"
              >
                Save Workshop Context
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blueprint" className="mt-4">
          {blueprint ? (
            <Card className="mt-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{blueprint.title}</CardTitle>
                    <CardDescription className="mt-2">
                      Total Duration: {blueprint.duration}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => {
                    toast.success("Blueprint saved to workspace!");
                  }}>
                    Save Blueprint
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Agenda</h3>
                  <div className="space-y-6">
                    {blueprint.agenda.map((item, index) => (
                      <Card key={index} className="border-muted">
                        <CardHeader className="py-3 px-4">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-md">{item.name}</CardTitle>
                            <Badge variant="outline">{item.duration} min</Badge>
                          </div>
                          <CardDescription>{item.activity}</CardDescription>
                        </CardHeader>
                        <CardContent className="py-3 px-4">
                          <div className="text-sm">{item.description}</div>
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Facilitation Prompts</h4>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {item.prompts.map((prompt, i) => (
                                <li key={i}>{prompt}</li>
                              ))}
                            </ul>
                          </div>

                          {item.materials && item.materials.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Materials Needed</h4>
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {item.materials.map((material, i) => (
                                  <li key={i}>{material}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Expected Outcomes</h4>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {item.expectedOutcomes.map((outcome, i) => (
                                <li key={i}>{outcome}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Facilitation Tips</h4>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {item.facilitationTips.map((tip, i) => (
                                <li key={i}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Materials List</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {blueprint.materialsList.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Follow-up Actions</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {blueprint.followupActions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-4">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-center">No Blueprint Generated Yet</h3>
                <p className="text-muted-foreground text-center mt-2 max-w-md">
                  Fill in the workshop design settings, then click "Generate Workshop Blueprint" to create your workshop agenda.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("settings")} 
                  className="mt-4"
                >
                  Go to Workshop Design
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
