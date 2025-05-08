
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Users, Clock } from "lucide-react";
import type { Attendee } from "../types/workshop";

interface WorkshopPeopleTimeProps {
  duration: number;
  setDuration: (d: number) => void;
  workshopType: 'online' | 'in-person';
  setWorkshopType: (type: 'online' | 'in-person') => void;
  workshopId: string | null;
  attendees?: Attendee[];
  updateAttendees?: (attendees: Attendee[]) => void;
}

export function WorkshopPeopleTime({
  duration,
  setDuration,
  workshopType,
  setWorkshopType,
  workshopId,
  attendees = [],
  updateAttendees
}: WorkshopPeopleTimeProps) {
  const [calendarInviteData, setCalendarInviteData] = useState<any>(null);
  const [localAttendees, setLocalAttendees] = useState<Attendee[]>(attendees.length ? attendees : [{ email: "", role: "" }]);
  const [dataWasLoadedFromCalendar, setDataWasLoadedFromCalendar] = useState<boolean>(false);

  // Sync prop changes to local state
  useEffect(() => {
    if (attendees.length > 0) {
      setLocalAttendees(attendees);
    }
  }, [attendees]);

  // Get calendar invite data if available
  useEffect(() => {
    if (workshopId && !dataWasLoadedFromCalendar) {
      const fetchCalendarData = async () => {
        try {
          const { data: workshop, error: workshopError } = await supabase
            .from('workshops')
            .select('invitation_source_id')
            .eq('id', workshopId)
            .single();

          if (workshopError || !workshop?.invitation_source_id) return;

          const { data: invite, error: inviteError } = await supabase
            .from('inbound_invites')
            .select('*')
            .eq('id', workshop.invitation_source_id)
            .maybeSingle();

          if (inviteError) {
            console.error("Error loading calendar data:", inviteError);
            return;
          }

          setCalendarInviteData(invite);
          
          // Pre-populate attendees if available from calendar invite, but only on initial load
          if (invite?.attendees && Array.isArray(invite.attendees) && invite.attendees.length > 0 && 
              (localAttendees.length === 0 || (localAttendees.length === 1 && !localAttendees[0].email))) {
            const calendarAttendees = invite.attendees.map((email: string) => ({
              email,
              role: ""
            }));
            
            setLocalAttendees(calendarAttendees);
            
            if (updateAttendees) {
              updateAttendees(calendarAttendees);
            }
          }
          
          setDataWasLoadedFromCalendar(true);
        } catch (error) {
          console.error("Error fetching calendar data:", error);
        }
      };

      fetchCalendarData();
    }
  }, [workshopId, updateAttendees, localAttendees, dataWasLoadedFromCalendar]);

  const addAttendee = () => {
    const newAttendees = [...localAttendees, { email: "", role: "" }];
    setLocalAttendees(newAttendees);
    if (updateAttendees) {
      updateAttendees(newAttendees);
    }
  };

  const removeAttendee = (index: number) => {
    const newAttendees = localAttendees.filter((_, i) => i !== index);
    setLocalAttendees(newAttendees);
    if (updateAttendees) {
      updateAttendees(newAttendees);
    }
  };

  const updateAttendeeField = (index: number, field: keyof Attendee, value: string) => {
    const newAttendees = [...localAttendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setLocalAttendees(newAttendees);
    if (updateAttendees) {
      updateAttendees(newAttendees);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Format and Duration</CardTitle>
          </div>
          <CardDescription>
            Choose the workshop format and set the duration
            {calendarInviteData && " (pre-filled from calendar but can be edited)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-base font-medium">Duration (minutes)</Label>
            <Input 
              id="duration"
              type="number"
              min="15"
              max="480"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              className="w-32 bg-background"
            />
          </div>
          
          <RadioGroup 
            value={workshopType} 
            onValueChange={(value) => setWorkshopType(value as 'online' | 'in-person')}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online">Online</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="in-person" id="in-person" />
              <Label htmlFor="in-person">In-person</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Attendees</CardTitle>
            {calendarInviteData?.attendees && (
              <span className="text-xs text-muted-foreground">
                From calendar invite (editable)
              </span>
            )}
          </div>
          <CardDescription>
            Add the workshop participants and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localAttendees.map((attendee, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input 
                      value={attendee.email || ""}
                      onChange={(e) => updateAttendeeField(index, "email", e.target.value)}
                      placeholder="Email address"
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={attendee.role || ""}
                      onChange={(e) => updateAttendeeField(index, "role", e.target.value)}
                      placeholder="Role (e.g. Product Manager)"
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeAttendee(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={addAttendee}
          >
            Add attendee
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
