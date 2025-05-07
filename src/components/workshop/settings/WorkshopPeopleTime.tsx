
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, Users, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Attendee } from "../types/workshop";

interface WorkshopPeopleTimeProps {
  duration: number;
  setDuration: (value: number) => void;
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
  const [localAttendees, setLocalAttendees] = useState<Attendee[]>(attendees.length > 0 ? attendees : [{
    role: "",
    count: 1
  }]);
  const [calendarInviteData, setCalendarInviteData] = useState<any>(null);

  useEffect(() => {
    // Initialize with passed attendees if available
    if (attendees.length > 0) {
      setLocalAttendees(attendees);
    }
  }, [attendees]);

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

          if (workshopError || !workshop?.invitation_source_id) return;

          const { data: invite, error: inviteError } = await supabase
            .from('inbound_invites')
            .select('*')
            .eq('id', workshop.invitation_source_id)
            .single();

          if (inviteError || !invite) return;

          setCalendarInviteData(invite);
          
          // Pre-populate attendees if available from calendar invite, but only on initial load
          if (invite.attendees && Array.isArray(invite.attendees) && invite.attendees.length > 0 && localAttendees.length <= 1 && !localAttendees[0].email) {
            const calendarAttendees = invite.attendees.map((email: string) => ({
              email,
              role: "",
              count: 1
            }));
            
            setLocalAttendees(calendarAttendees);
            if (updateAttendees) {
              updateAttendees(calendarAttendees);
            }
          }
        } catch (error) {
          console.error("Error fetching calendar data:", error);
        }
      };

      fetchCalendarData();
    }
  }, [workshopId, updateAttendees, localAttendees]);

  const addAttendee = () => {
    const newAttendees = [...localAttendees, { role: "", count: 1 }];
    setLocalAttendees(newAttendees);
    if (updateAttendees) {
      updateAttendees(newAttendees);
    }
  };

  const updateAttendee = (index: number, field: keyof Attendee, value: string | number) => {
    const newAttendees = [...localAttendees];
    newAttendees[index] = {
      ...newAttendees[index],
      [field]: value
    };
    setLocalAttendees(newAttendees);
    if (updateAttendees) {
      updateAttendees(newAttendees);
    }
  };

  const removeAttendee = (index: number) => {
    if (localAttendees.length > 1) {
      const newAttendees = [...localAttendees];
      newAttendees.splice(index, 1);
      setLocalAttendees(newAttendees);
      if (updateAttendees) {
        updateAttendees(newAttendees);
      }
    }
  };

  return (
    <div className="space-y-4">
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
                From calendar invite (editable)
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-3 mt-2">
          {localAttendees.map((attendee, index) => (
            <div key={index} className="grid grid-cols-12 gap-2">
              <Input 
                placeholder="Email address" 
                value={attendee.email || ""}
                onChange={(e) => updateAttendee(index, "email", e.target.value)} 
                className="col-span-6" 
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
                disabled={localAttendees.length <= 1}
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
    </div>
  );
}
