
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useWorkshop } from "@/hooks/useWorkshop";
import { useWorkshopAuth } from "@/hooks/useWorkshopAuth";
import { WorkshopLoading } from "@/components/workshop/WorkshopLoading";
import { WorkshopList } from "@/components/workshop/WorkshopList";
import { WorkshopNameEditor } from "@/components/workshop/WorkshopNameEditor";
import { WorkshopActions } from "@/components/workshop/WorkshopActions";
import { CalendarInviteInfo } from "@/components/workshop/CalendarInviteInfo";
import { CalendarIntegrationInfo } from "@/components/workshop/CalendarIntegrationInfo";
import { BlueprintDetails } from "@/components/workshop/blueprint/BlueprintDetails";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, AlertCircle } from "lucide-react";

const Workshop = () => {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const { loading, workshopName, getWorkshop, createWorkshop, updateWorkshopName } = useWorkshop();
  const { isAuthenticating } = useWorkshopAuth();

  useEffect(() => {
    if (isAuthenticating) return;

    if (workshopId) {
      console.log("Workshop page: Loading workshop with ID:", workshopId);
      getWorkshop(workshopId);
    }
  }, [workshopId, isAuthenticating, getWorkshop]);

  if (isAuthenticating) {
    return <WorkshopLoading message="Authenticating..." />;
  }

  if (loading && workshopId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <WorkshopLoading message="Loading blueprint..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        {!workshopId ? (
          <>
            <h1 className="text-3xl font-bold mb-6">My Blueprints</h1>
            <CalendarIntegrationInfo />
            <WorkshopList onCreateWorkshop={createWorkshop} />
          </>
        ) : (
          <>
            <Alert className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50">
              <Terminal className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
              <AlertTitle className="text-yellow-700 dark:text-yellow-300">Premium Features Coming Soon!</AlertTitle>
              <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                Full workshop drafting, whiteboarding, and stakeholder endorsements are part of our upcoming premium offering. For now, enjoy AI-powered blueprint generation!
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2 mb-6">
              <WorkshopActions />
              <WorkshopNameEditor
                initialName={workshopName}
                workshopId={workshopId}
                onNameUpdate={(name) => updateWorkshopName(name)}
              />
            </div>
            
            {/* Display calendar invite info if applicable */}
            {workshopId && <CalendarInviteInfo workshopId={workshopId} />}
            
            <BlueprintDetails workshopId={workshopId} />
          </>
        )}
      </div>
    </div>
  );
}

export default Workshop;
