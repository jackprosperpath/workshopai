
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import ConsensusWorkshop from "@/components/ConsensusWorkshop";
import { useWorkshop } from "@/hooks/useWorkshop";
import { useWorkshopAuth } from "@/hooks/useWorkshopAuth";
import { WorkshopLoading } from "@/components/workshop/WorkshopLoading";
import { WorkshopList } from "@/components/workshop/WorkshopList";
import { WorkshopNameEditor } from "@/components/workshop/WorkshopNameEditor";
import { WorkshopActions } from "@/components/workshop/WorkshopActions";
import { CalendarInviteInfo } from "@/components/workshop/CalendarInviteInfo";

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
        <WorkshopLoading message="Loading workshop..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        {!workshopId ? (
          <WorkshopList onCreateWorkshop={createWorkshop} />
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-6">
              <WorkshopActions />
              <WorkshopNameEditor 
                initialName={workshopName}
                workshopId={workshopId}
                onNameUpdate={updateWorkshopName}
              />
            </div>
            
            {/* Display calendar invite info if applicable */}
            {workshopId && <CalendarInviteInfo workshopId={workshopId} />}
            
            <ConsensusWorkshop />
          </>
        )}
      </div>
    </div>
  );
}

export default Workshop;
