
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export function CalendarIntegrationInfo() {
  return (
    <Card className="mb-6">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-lg">Create Workshop from Calendar Invite</h3>
            <p className="text-muted-foreground">
              Add <strong>agenda@teho.ai</strong> as an attendee to your calendar invites to automatically 
              create workshops from your meetings.
            </p>
          </div>
        </div>
        
        <div className="text-sm text-center pt-2 border-t text-muted-foreground">
          Or simply create a workshop directly using the options below
        </div>
      </CardContent>
    </Card>
  );
}
