
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-primary to-secondary px-6 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>
      <div className="mx-auto max-w-7xl text-center">
        <div className="animate-fade-up space-y-8">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Transform Team Ideas into 
            <span className="relative whitespace-nowrap">
              <span className="relative ml-2 inline-flex items-center space-x-2">
                AI-Powered Solutions
                <Sparkles className="ml-2 h-8 w-8 text-accent" />
              </span>
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-300">
            A collaborative prompt‑engineering workspace that turns messy ideas into polished solutions—with live feedback, version history, and stakeholder sign-off.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-accent text-primary hover:bg-accent/90">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-white hover:bg-white/10">
              Book Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
