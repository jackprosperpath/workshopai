import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users, Minus, PlusCircle, Wand, Loader2, UserPlus, Info } from "lucide-react";
import { ItemList } from "../ItemList";
import { DocumentUpload } from "../DocumentUpload";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormatSelector } from "../FormatSelector";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PredefinedFormat } from "@/types/OutputFormat";
import type { AiModel } from "@/hooks/usePromptCanvas";
import type { Attendee, TeamMemberRole } from "../types/workshop";

interface WorkshopSettingsFormProps {
  problem: string;
  setProblem: (value: string) => void;
  metrics: string[];
  setMetrics: (metrics: string[]) => void;
  metricInput: string;
  setMetricInput: (value: string) => void;
  addMetric: () => void;
  constraints: string[];
  constraintInput: string;
  setConstraintInput: (value: string) => void;
  addConstraint: () => void;
  selectedModel: AiModel;
  setSelectedModel: (model: AiModel) => void;
  selectedFormat?: {
    type: PredefinedFormat;
    customFormat?: string;
    description: string;
  };
  updateFormat?: (format: PredefinedFormat) => void;
  customFormat?: string;
  setCustomFormat?: (value: string) => void;
  onGenerate: () => void;
  loading: boolean;
  duration: number;
  setDuration: (value: number) => void;
}

export function WorkshopSettingsForm({
  problem,
  setProblem,
  metrics,
  setMetrics,
  metricInput,
  setMetricInput,
  addMetric,
  constraints,
  constraintInput,
  setConstraintInput,
  addConstraint,
  selectedModel,
  setSelectedModel,
  selectedFormat,
  updateFormat,
  customFormat,
  setCustomFormat,
  onGenerate,
  loading,
  duration,
  setDuration
}: WorkshopSettingsFormProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([{
    role: "",
    count: 1
  }]);
  const [documents, setDocuments] = useState<{
    name: string;
    path: string;
    size: number;
  }[]>([]);
  const {
    teamMembers
  } = useTeamMembers(new URLSearchParams(window.location.search).get('id'));

  useEffect(() => {
    if (teamMembers.length > 0) {
      const roleMap = new Map<string, Attendee>();
      attendees.forEach(attendee => {
        if (attendee.role) {
          roleMap.set(attendee.role, attendee);
        }
      });
      teamMembers.forEach(member => {
        if (!member.role) return;
        if (roleMap.has(member.role)) {
          const existingRole = roleMap.get(member.role)!;
          existingRole.count += 1;
        } else {
          roleMap.set(member.role, {
            role: member.role,
            count: 1,
            email: member.email
          });
        }
      });
      setAttendees([...roleMap.values()]);
    }
  }, [teamMembers]);

  const addAttendeeRole = () => {
    setAttendees([...attendees, {
      role: "",
      count: 1
    }]);
  };

  const updateAttendee = (index: number, field: keyof Attendee, value: string | number) => {
    const newAttendees = [...attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      [field]: value
    };
    setAttendees(newAttendees);
  };

  const removeAttendeeRole = (index: number) => {
    if (attendees.length > 1) {
      const newAttendees = [...attendees];
      newAttendees.splice(index, 1);
      setAttendees(newAttendees);
    }
  };

  return <div className="space-y-6">
      {selectedFormat && updateFormat && customFormat !== undefined && setCustomFormat && <div className="space-y-2">
          <Label>Deliverable</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Label className="text-sm text-muted-foreground block">
                Select the desired format for the generated solution
              </Label>
            </TooltipTrigger>
            <TooltipContent>
              Choose a predefined format or create your own
            </TooltipContent>
          </Tooltip>
          <FormatSelector selectedFormat={selectedFormat} updateFormat={updateFormat} customFormat={customFormat} setCustomFormat={setCustomFormat} />
        </div>}

      <div className="space-y-2">
        <Label htmlFor="problem">Workshop Objective</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="text-sm text-muted-foreground block">
              Clearly describe the problem or opportunity that needs to be explored
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            Be specific and concise in describing your problem
          </TooltipContent>
        </Tooltip>
        <Textarea id="problem" placeholder="Describe the problem you want to solve..." className="min-h-[100px]" value={problem} onChange={e => setProblem(e.target.value)} />
      </div>

      <ItemList label="Success Metrics" tooltipText="Define how success will be measured" items={metrics} inputValue={metricInput} setInputValue={setMetricInput} onAdd={addMetric} placeholder="Add success metric..." />

      <ItemList label="Constraints" tooltipText="List any limitations or requirements" items={constraints} inputValue={constraintInput} setInputValue={setConstraintInput} onAdd={addConstraint} placeholder="Add constraint..." />

      <div className="space-y-2">
        <Label>Duration</Label>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
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
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Attendees</Label>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {teamMembers.length > 0 && <Badge variant="outline" className="ml-2">
              {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''} available
            </Badge>}
        </div>
        
        {attendees.map((attendee, index) => <div key={index} className="flex gap-2 items-center">
            <Input placeholder="Role (e.g., Developer, Manager)" value={attendee.role} onChange={e => updateAttendee(index, "role", e.target.value)} className="flex-1" />
            <Input type="number" min="1" placeholder="Count" value={attendee.count} onChange={e => updateAttendee(index, "count", parseInt(e.target.value) || 1)} className="w-20" />
            <Button variant="ghost" size="sm" onClick={() => removeAttendeeRole(index)} disabled={attendees.length <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
          </div>)}
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addAttendeeRole} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> Add Role
          </Button>
          
          {teamMembers.length > 0 && <Button variant="outline" size="sm" onClick={() => {
          const tab = document.querySelector('button[value="team"]') as HTMLButtonElement;
          if (tab) tab.click();
        }} className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" /> Manage Team
            </Button>}
        </div>
        
        {teamMembers.length === 0 && <Card className="border-dashed bg-muted/50">
            <CardContent className="p-4 text-sm text-muted-foreground">
              <p>Add team members on the Team tab to automatically include them as attendees.</p>
            </CardContent>
          </Card>}
      </div>

      <div className="space-y-2">
        <Label>Workshop Documents</Label>
        <DocumentUpload onDocumentsUpdate={setDocuments} />
      </div>

      <Button onClick={onGenerate} disabled={loading || !problem} className="w-full">
        {loading ? <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Blueprint...
          </> : <>
            <Wand className="mr-2 h-4 w-4" />
            Generate Workshop Blueprint
          </>}
      </Button>
    </div>;
}
