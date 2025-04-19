
import { Navbar } from "@/components/Navbar";
import ConsensusWorkshop from "@/components/ConsensusWorkshop";

const Workshop = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Premium Workshop</h1>
          <p className="text-muted-foreground">Collaborate with your team in real-time with our premium features</p>
        </div>
        <ConsensusWorkshop />
      </div>
    </div>
  );
};

export default Workshop;
