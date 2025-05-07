
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

interface CalendarSourceInfoProps {
  isFromCalendar: boolean;
}

export function CalendarSourceInfo({ isFromCalendar }: CalendarSourceInfoProps) {
  if (!isFromCalendar) return null;

  return (
    <Card className="bg-accent/10 border-accent mb-4">
      <CardContent className="p-4 flex items-center">
        <InfoIcon className="h-5 w-5 mr-3 text-accent" />
        <div className="text-sm">
          This workshop was created from a calendar invitation. Some fields have been pre-filled based on the meeting details.
        </div>
      </CardContent>
    </Card>
  );
}
