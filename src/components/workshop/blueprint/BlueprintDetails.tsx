
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBlueprintData } from "@/hooks/useBlueprintData";
import { BlueprintContent } from "./BlueprintContent";
import { Share2, Info, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface BlueprintDetailsProps {
  workshopId: string;
}

export function BlueprintDetails({ workshopId }: BlueprintDetailsProps) {
  const { blueprint, isLoading, error } = useBlueprintData(workshopId);
  const [shareUrl, setShareUrl] = useState("");
  
  useEffect(() => {
    if (workshopId) {
      const url = `${window.location.origin}/blueprint/${workshopId}`;
      setShareUrl(url);
    }
  }, [workshopId]);
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };
  
  const shareWithAttendees = async () => {
    try {
      await supabase.functions.invoke("share-workshop", {
        body: { workshopId }
      });
      toast.success("Blueprint shared with attendees!");
    } catch (error) {
      console.error("Error sharing blueprint:", error);
      toast.error("Failed to share blueprint");
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="h-8 w-64 bg-gray-200 rounded mb-4 mx-auto"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-2 mx-auto"></div>
              <div className="h-4 w-72 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load blueprint data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Blueprint</CardTitle>
            <div className="flex gap-3">
              <Button variant="outline" onClick={copyShareLink}>
                <Share2 className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              {blueprint?.attendees && blueprint.attendees.length > 0 && (
                <Button onClick={shareWithAttendees}>
                  Share with Attendees
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="blueprint">
            <TabsList className="mb-4">
              <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
              <TabsTrigger value="info">About Blueprints</TabsTrigger>
            </TabsList>
            
            <TabsContent value="blueprint">
              {blueprint ? (
                <BlueprintContent blueprint={blueprint} />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">No blueprint data available</div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="info">
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-lg">What is a Blueprint?</h3>
                    <p className="text-gray-700">
                      A blueprint is an AI-generated meeting plan that includes objectives, 
                      agenda items, and a timeline to help you run more effective meetings.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-lg">Automatic Creation</h3>
                    <p className="text-gray-700">
                      Add <span className="font-mono font-semibold">agenda@teho.ai</span> to 
                      any calendar invite, and we'll automatically generate and email you a 
                      blueprint for your meeting.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Premium Features Alert */}
      <Alert className="bg-gray-50 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <AlertDescription className="text-gray-700">
            Advanced features like Solution Canvas, Whiteboarding, and Endorsement are available in the premium version.
          </AlertDescription>
          <Button variant="outline" className="whitespace-nowrap">
            Learn More
          </Button>
        </div>
      </Alert>
    </div>
  );
}
