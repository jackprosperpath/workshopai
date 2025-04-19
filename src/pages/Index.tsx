
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { LogoStrip } from "@/components/LogoStrip";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <LogoStrip />
    </div>
  );
};

export default Index;
