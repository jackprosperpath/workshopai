
import { Mail, Info, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function CalendarIntegrationInfo() {
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText("agenda@teho.ai")
      .then(() => toast.success("Email address copied to clipboard"))
      .catch(err => toast.error("Failed to copy email address"));
  };

  return (
    <Card className="border-dashed border-accent mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Mail className="mr-2 h-5 w-5 text-accent" />
          Calendar Integration
        </CardTitle>
        <CardDescription>
          Create workshop blueprints directly from your calendar invites
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
              <div>
                <h4 className="font-medium mb-1">How it works</h4>
                <ol className="text-sm text-muted-foreground space-y-2 ml-5 list-decimal">
                  <li>Create a calendar invite in Google Calendar or Outlook</li>
                  <li>Add <span className="font-mono bg-accent/10 px-1 rounded">agenda@teho.ai</span> as an attendee</li>
                  <li>Fill in your meeting details, title, and description</li>
                  <li>Send the invite</li>
                  <li>Our system will automatically generate a workshop blueprint</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={copyEmailToClipboard}
              className="flex items-center"
            >
              Copy Calendar Email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <a 
              href="https://calendar.google.com/calendar/u/0/r/eventedit" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline"
            >
              Open Google Calendar
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
