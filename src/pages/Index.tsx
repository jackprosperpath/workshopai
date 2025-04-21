import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { LogoStrip } from "@/components/LogoStrip";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { CTA } from "@/components/CTA";
import { WhyTeamsLove } from "@/components/WhyTeamsLove";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <WhyTeamsLove />
      <Testimonials />
      <Pricing />
      <CTA />
    </div>
  );
};

export default Index;
