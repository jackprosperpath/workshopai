
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { LogoStrip } from "@/components/LogoStrip";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { CTA } from "@/components/CTA";
import ConsensusWorkshop from "@/components/ConsensusWorkshop";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-6 py-12 bg-background rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
          Try It <span className="text-primary">Now</span>
        </h2>
        <ConsensusWorkshop />
      </div>
      <LogoStrip />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
    </div>
  );
};

export default Index;
