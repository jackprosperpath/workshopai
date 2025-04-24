
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Loader2, Clock, Users, FileText, AlertTriangle, Wand, Calendar, PlusCircle, Minus, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ItemList } from "./ItemList";
import { FormatSelector } from "./FormatSelector";
import { usePromptCanvas } from "@/hooks/usePromptCanvas";
import { useWorkshopActions } from "@/hooks/useWorkshopActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUpload } from "./DocumentUpload";
import { AiModel } from "@/hooks/usePromptCanvas";

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
  // Get existing context from usePromptCanvas hook
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

  const { handleSaveWorkshop } = useWorkshopActions();

  // Blueprint-specific state
  const [objective, setObjective] = useState("");
  const [duration, setDuration] = useState("120");
  const [attendees, setAttendees] = useState<Attendee[]>([{ role: "", count: 1 }]);
  const [prereads, setPrereads] = useState("");
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [documents, setDocuments] = useState<{ name: string; path: string; size: number; }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("context");
  const [updatedContextFields, setUpdatedContextFields] = useState(false);

  // When problem is set from the context tab, update objective if it's empty
  useEffect(() => {
    if (problem && !objective && !updatedContextFields) {
      setObjective(problem);
    }
  }, [problem, objective, updatedContextFields]);

  // Add attendee role
  const addAttendeeRole = () => {
    setAttendees([...attendees, { role: "", count: 1 }]);
  };

  // Update attendee
  const updateAttendee = (index: number, field: keyof Attendee, value: string | number) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  // Remove attendee role
  const removeAttendeeRole = (index: number) => {
    if (attendees.length > 1) {
      const newAttendees = [...attendees];
      newAttendees.splice(index, 1);
      setAttendees(newAttendees);
    }
  };

  // Generate blueprint
  const generateBlueprint = async () => {
    if (!objective) {
      toast.error("Please specify an objective for your workshop");
      return;
    }

    // Save context data to workshop first
    handleSaveWorkshop(problem, metrics, constraints, selectedModel);

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-workshop-blueprint", {
        body: {
          context: problem,
          objective,
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

  // Calculate total duration
  const getTotalDuration = (agenda: BlueprintAgendaItem[]) => {
    if (!agenda) return 0;
    return agenda.reduce((total, item) => {
      const duration = parseInt(item.duration) || 0;
      return total + duration;
    }, 0);
  };

  return (
    <div className="space-y-8 pb-10">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="context">Workshop Context</TabsTrigger>
          <TabsTrigger value="settings">Blueprint Settings</TabsTrigger>
          <TabsTrigger value="blueprint">Generated Blueprint</TabsTrigger>
        </TabsList>

        {/* Context Tab */}
        <TabsContent value="context" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Context</CardTitle>
              <CardDescription>Define your problem, success metrics, and constraints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="problem">Scope Statement</Label>
                <Textarea
                  id="problem"
                  placeholder="Describe the problem you want to solve..."
                  className="min-h-[100px]"
                  value={problem}
                  onChange={(e) => {
                    setProblem(e.target.value);
                    if (!updatedContextFields) {
                      setObjective(e.target.value);
                    }
                  }}
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
                <p className="text-xs text-muted-foreground mt-1">
                  Select which AI model to use for generating solutions. GPT-4o-mini is faster but less powerful, while GPT-4o is more powerful but slower.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Deliverable</Label>
                <FormatSelector
                  selectedFormat={selectedFormat}
                  updateFormat={updateFormat}
                  customFormat={customFormat}
                  setCustomFormat={setCustomFormat}
                />
              </div>

              <div className="space-y-2">
                <Label>Context Documents</Label>
                <DocumentUpload onDocumentsUpdate={setDocuments} />
              </div>

              <Button
                onClick={() => {
                  setActiveTab("settings");
                  handleSaveWorkshop(problem, metrics, constraints, selectedModel);
                  setUpdatedContextFields(true);
                }}
                className="w-full"
              >
                Continue to Blueprint Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Blueprint Settings</CardTitle>
              <CardDescription>
                Configure the details for your workshop blueprint
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="objective">Workshop Objective</Label>
                <Textarea
                  id="objective"
                  placeholder="What specific outcome do you want from this workshop?"
                  value={objective}
                  onChange={(e) => {
                    setObjective(e.target.value);
                    setUpdatedContextFields(true);
                  }}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="duration">Duration</Label>
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="prereads">Pre-reads or Prerequisites</Label>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <Textarea
                  id="prereads"
                  placeholder="Any material participants should review before the workshop"
                  value={prereads}
                  onChange={(e) => setPrereads(e.target.value)}
                />
              </div>

              <Button 
                onClick={generateBlueprint} 
                disabled={loading || !objective}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blueprint Tab */}
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
                    // Here you would implement saving this blueprint to the workspace
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
                  Fill in the workshop context and blueprint settings, then click "Generate Workshop Blueprint" to create your workshop agenda.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("context")} 
                  className="mt-4"
                >
                  Start with Workshop Context
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
