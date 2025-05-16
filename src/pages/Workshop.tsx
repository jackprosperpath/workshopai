
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

const Workshop = () => {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const { loading, workshopName, getWorkshop, createWorkshop, updateWorkshopName } = useWorkshop();
  const { isAuthenticating } = useWorkshopAuth();

  useEffect(() => {
    if (isAuthenticating) return;

    if (workshopId) {
      getWorkshop(workshopId);
    }
  }, [workshopId, isAuthenticating]);

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
            <div className="flex flex-col gap-2 mb-6">
              <WorkshopActions />
              <WorkshopNameEditor
                name={workshopName}
                onSave={(name) => updateWorkshopName(workshopId, name)}
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
