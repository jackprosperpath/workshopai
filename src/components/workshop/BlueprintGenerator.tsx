
import { useState } from "react";
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
import { Loader2, Clock, Users, FileText, AlertTriangle, Wand } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [context, setContext] = useState("");
  const [objective, setObjective] = useState("");
  const [duration, setDuration] = useState("120");
  const [attendees, setAttendees] = useState<Attendee[]>([{ role: "", count: 1 }]);
  const [prereads, setPrereads] = useState("");
  const [constraints, setConstraints] = useState("");
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

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
    if (!objective) {
      toast.error("Please specify an objective for your workshop");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-workshop-blueprint", {
        body: {
          context,
          objective,
          duration,
          attendees: attendees.filter(a => a.role.trim() !== ""),
          prereads,
          constraints
        }
      });

      if (error) {
        throw error;
      }

      if (data.blueprint) {
        setBlueprint(data.blueprint);
        toast.success("Workshop blueprint generated successfully");
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

  const getTotalDuration = (agenda: BlueprintAgendaItem[]) => {
    if (!agenda) return 0;
    return agenda.reduce((total, item) => {
      const duration = parseInt(item.duration) || 0;
      return total + duration;
    }, 0);
  };

  return (
    <div className="space-y-8 pb-10">
      <Card>
        <CardHeader>
          <CardTitle>Auto-Blueprint Generator</CardTitle>
          <CardDescription>
            Generate a customized workshop blueprint based on your specific needs and constraints
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="objective">Workshop Objective (Required)</Label>
            <Textarea
              id="objective"
              placeholder="What specific outcome do you want from this workshop?"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context</Label>
            <Textarea
              id="context"
              placeholder="Provide background information about this workshop"
              value={context}
              onChange={(e) => setContext(e.target.value)}
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
                  ×
                </Button>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addAttendeeRole}
            >
              Add Role
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

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="constraints">Constraints</Label>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </div>
            <Textarea
              id="constraints"
              placeholder="Any limitations or requirements (e.g., remote only, accessibility needs)"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter>
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
        </CardFooter>
      </Card>

      {blueprint && (
        <Card className="mt-8">
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
      )}
    </div>
  );
}
