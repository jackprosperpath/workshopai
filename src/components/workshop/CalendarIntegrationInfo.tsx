
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CalendarIntegrationInfo() {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Get Started with Teho</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Alert className="border-primary/20 bg-primary/5">
          <Calendar className="h-5 w-5 text-primary" />
          <AlertTitle className="font-medium">Option 1: Calendar Integration</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              Create a workshop directly from your calendar by adding 
              <code className="mx-1 px-1 py-0.5 bg-muted rounded text-sm">agenda@teho.ai</code>
              as an attendee to any meeting.
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Include your agenda in the meeting description</li>
              <li>We'll send you a link to access your workshop</li>
              <li>Your calendar-created workshops will appear in your workshop history</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Info className="h-5 w-5" />
          <AlertTitle className="font-medium">Option 2: Create Directly in Teho</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              Create a workshop directly in the app and customize it to your needs.
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Create a blank workshop blueprint</li>
              <li>Choose from our templates (coming soon)</li>
              <li>Customize every aspect of your workshop</li>
            </ul>
            <Button 
              onClick={() => navigate("/workshop")} 
              variant="outline" 
              className="mt-3"
            >
              Create New Workshop
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
