
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export const CTA = () => {
  return (
    <div className="bg-primary">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your team's AI workflow?
            <br />
            Start your free trial today
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Join innovative teams already using our platform to create better AI solutions, faster.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="bg-accent text-primary hover:bg-accent/90">
              Get Started
              <Rocket className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
