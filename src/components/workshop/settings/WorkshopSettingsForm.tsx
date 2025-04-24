
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users, Minus, PlusCircle, Wand, Loader2 } from "lucide-react";
import { ItemList } from "../ItemList";
import { DocumentUpload } from "../DocumentUpload";
import type { AiModel } from "@/hooks/usePromptCanvas";
import type { Attendee } from "../types/workshop";

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
  onGenerate: () => void;
  loading: boolean;
}

export function WorkshopSettingsForm({
  problem,
  setProblem,
  metrics,
  metricInput,
  setMetricInput,
  addMetric,
  constraints,
  constraintInput,
  setConstraintInput,
  addConstraint,
  selectedModel,
  setSelectedModel,
  onGenerate,
  loading,
}: WorkshopSettingsFormProps) {
  const [duration, setDuration] = useState("120");
  const [attendees, setAttendees] = useState<Attendee[]>([{ role: "", count: 1 }]);
  const [documents, setDocuments] = useState<{ name: string; path: string; size: number; }[]>([]);

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Duration</Label>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
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
      </div>

      <Button 
        onClick={onGenerate} 
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
    </div>
  );
}
