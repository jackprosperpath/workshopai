
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Clock, 
  Users, 
  UserPlus, 
  Minus, 
  Globe, 
  Computer 
} from "lucide-react";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Attendee } from "../types/workshop";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkshopPeopleTimeProps {
  duration: number;
  setDuration: (value: number) => void;
  workshopType: 'online' | 'in-person';
  setWorkshopType: (type: 'online' | 'in-person') => void;
}

export function WorkshopPeopleTime({
  duration,
  setDuration,
  workshopType,
  setWorkshopType
}: WorkshopPeopleTimeProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([{
    role: "",
    count: 1
  }]);
  
  const { teamMembers } = useTeamMembers(
    new URLSearchParams(window.location.search).get('id')
  );

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Workshop Duration</Label>
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
        <Label>Workshop Type</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="text-sm text-muted-foreground block">
              Select whether the workshop will be conducted online or in-person
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            This helps in generating a more tailored workshop blueprint
          </TooltipContent>
        </Tooltip>
        <Select value={workshopType} onValueChange={(value: 'online' | 'in-person') => setWorkshopType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select workshop type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Online
              </div>
            </SelectItem>
            <SelectItem value="in-person">
              <div className="flex items-center gap-2">
                <Computer className="h-4 w-4" /> In-Person
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Attendees & Roles</Label>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {teamMembers.length > 0 && 
            <Badge variant="outline" className="ml-2">
              {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''} available
            </Badge>
          }
        </div>
        
        {attendees.map((attendee, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input 
              placeholder="Role (e.g., Product Manager, Engineer)" 
              value={attendee.role} 
              onChange={e => updateAttendee(index, "role", e.target.value)} 
              className="flex-1" 
            />
            <Select 
              value={attendee.count.toString()} 
              onValueChange={(value) => updateAttendee(index, "count", parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="#" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <UserPlus className="h-4 w-4" /> Add Role
        </Button>
        
        {teamMembers.length === 0 && 
          <Card className="border-dashed bg-muted/50">
            <CardContent className="p-4 text-sm text-muted-foreground">
              <p>You can invite team members after creating your workshop.</p>
            </CardContent>
          </Card>
        }
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <span className="text-primary">💡</span> 
          Workshop Tip
        </h4>
        <p className="text-sm text-muted-foreground">
          For complex decisions, consider adding a "Decider" role to make final calls when consensus can't be reached.
        </p>
      </div>
    </div>
  );
}
