
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export function CalendarIntegrationInfo() {
  return <Card className="mb-6">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-lg">Auto-Create Blueprints from Calendar Invites</h3>
            <p className="text-muted-foreground">
              Add <strong>agenda@teho.ai</strong> to your calendar invites, and we'll automatically generate an AI meeting blueprint and email you the link.
            </p>
          </div>
        </div>
        
        <div className="text-sm text-center pt-2 border-t text-muted-foreground">Or create a new blueprint manually below</div>
      </CardContent>
    </Card>;
}

