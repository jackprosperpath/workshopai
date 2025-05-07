
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { TemplateSelector } from "./TemplateSelector";
import { DocumentUpload } from "../DocumentUpload";
import { ItemList } from "../ItemList";
import { CheckCircle, Clock, Users, Plus, Minus, ChevronDown, FileText } from "lucide-react";
import type { WorkshopTemplate } from "@/types/WorkshopTemplates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import type { Attendee } from "../types/workshop";

interface SimplifiedWorkshopFormProps {
  workshopId: string | null;
  workshopName: string;
  problem: string;
  setProblem: (value: string) => void;
  metrics: string[];
  metricInput: string;
  setMetricInput: (value: string) => void;
  addMetric: () => void;
  duration: number;
  setDuration: (value: number) => void;
  workshopType: 'online' | 'in-person';
  setWorkshopType: (type: 'online' | 'in-person') => void;
  setWorkshopName: (name: string) => void;
  loading: boolean;
  onGenerate: () => void;
}

export function SimplifiedWorkshopForm({
  workshopId,
  workshopName,
  problem,
  setProblem,
  metrics,
  metricInput,
  setMetricInput,
  addMetric,
  duration,
  setDuration,
  workshopType,
  setWorkshopType,
  setWorkshopName,
  loading,
  onGenerate
}: SimplifiedWorkshopFormProps) {
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([{
    role: "",
    count: 1
  }]);
  const [documents, setDocuments] = useState<{ name: string; path: string; size: number; }[]>([]);
  const [calendarInviteData, setCalendarInviteData] = useState<any>(null);

  useEffect(() => {
    // Fetch calendar invite data if this workshop was created from a calendar invite
    if (workshopId) {
      const fetchCalendarData = async () => {
        try {
          const { data: workshop, error: workshopError } = await supabase
            .from('workshops')
            .select('invitation_source_id')
            .eq('id', workshopId)
            .single();

          if (workshopError || !workshop.invitation_source_id) return;

          const { data: invite, error: inviteError } = await supabase
            .from('inbound_invites')
            .select('*')
            .eq('id', workshop.invitation_source_id)
            .single();

          if (inviteError || !invite) return;

          setCalendarInviteData(invite);
          
          // Pre-populate attendees if available from calendar invite
          if (invite.attendees && Array.isArray(invite.attendees) && invite.attendees.length > 0) {
            const calendarAttendees = invite.attendees.map((email: string) => ({
              email,
              role: "",
              count: 1
            }));
            
            setAttendees(calendarAttendees);
          }
        } catch (error) {
          console.error("Error fetching calendar data:", error);
        }
      };

      fetchCalendarData();
    }
  }, [workshopId]);

  const handleTemplateSelect = (template: WorkshopTemplate) => {
    setProblem(template.purpose);
    setIsTemplatesOpen(false);
  };

  const addAttendee = () => {
    setAttendees([...attendees, { role: "", count: 1 }]);
  };

  const updateAttendee = (index: number, field: keyof Attendee, value: string | number) => {
    const newAttendees = [...attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      [field]: value
    };
    setAttendees(newAttendees);
  };

  const removeAttendee = (index: number) => {
    if (attendees.length > 1) {
      const newAttendees = [...attendees];
      newAttendees.splice(index, 1);
      setAttendees(newAttendees);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="workshop-name" className="text-base font-medium">Workshop Title</Label>
          <Input 
            id="workshop-name" 
            value={workshopName}
            onChange={(e) => setWorkshopName(e.target.value)}
            placeholder="Enter workshop title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base font-medium">Workshop Duration</Label>
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

          <div className="space-y-2">
            <Label className="text-base font-medium">Workshop Type</Label>
            <Select value={workshopType} onValueChange={(value: 'online' | 'in-person') => setWorkshopType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select workshop type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Attendees & Roles</Label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {calendarInviteData?.attendees && (
                <span className="text-xs text-muted-foreground">
                  From calendar invite
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-3 mt-2">
            {attendees.map((attendee, index) => (
              <div key={index} className="grid grid-cols-12 gap-2">
                <Input 
                  placeholder="Email address" 
                  value={attendee.email || ""}
                  onChange={(e) => updateAttendee(index, "email", e.target.value)} 
                  className="col-span-6" 
                  readOnly={!!calendarInviteData?.attendees}
                />
                <Input 
                  placeholder="Role (e.g., Facilitator)" 
                  value={attendee.role || ""}
                  onChange={(e) => updateAttendee(index, "role", e.target.value)} 
                  className="col-span-5" 
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeAttendee(index)}
                  disabled={attendees.length <= 1}
                  className="col-span-1"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addAttendee} 
              className="flex items-center gap-1 mt-2"
            >
              <Plus className="h-4 w-4" /> Add Attendee
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="problem" className="text-base font-medium">Workshop Objective</Label>
          <Textarea
            id="problem"
            placeholder="What do you need to achieve in this workshop?"
            className="min-h-[100px] text-base"
            value={problem}
            onChange={e => setProblem(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">Be specific about what you want to achieve.</p>
        </div>

        <ItemList
          label="Success Metrics (Optional)"
          tooltipText="How will you know if this workshop was successful?"
          items={metrics}
          inputValue={metricInput}
          setInputValue={setMetricInput}
          onAdd={addMetric}
          placeholder="Add success metric..."
        />

        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" /> Context Documents (Optional)
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-muted-foreground">
                Upload documents to provide additional context for the workshop
              </p>
            </TooltipTrigger>
            <TooltipContent>
              Supported formats: PDF, DOC, DOCX, TXT
            </TooltipContent>
          </Tooltip>
          <DocumentUpload onDocumentsUpdate={setDocuments} />
        </div>

        <Collapsible 
          open={isTemplatesOpen} 
          onOpenChange={setIsTemplatesOpen}
          className="border rounded-md mt-4 overflow-hidden"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent/20 transition-colors">
            <span className="font-medium">Or Choose from Workshop Templates</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isTemplatesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-t bg-muted/10">
            <TemplateSelector onSelectTemplate={handleTemplateSelect} />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={onGenerate} 
          disabled={loading || !problem}
          className="flex items-center"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Generating...
            </>
          ) : (
            <>
              Generate Blueprint <CheckCircle className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
