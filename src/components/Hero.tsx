
import { Button } from "./ui/button";

export const Hero = () => {
  return (
    <section className="flex flex-col items-center text-center py-32 px-8">
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          TEAMS <span className="relative text-primary">
            & MODELS
            <span className="absolute inset-x-0 bottom-2 h-3 bg-primary/20 -z-10 rounded"></span>
          </span> WORKING TOGETHER
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          WorkshopAI transforms any meeting into an interactive AI co‑creation workshop that drives instant team buy‑in.
        </p>
        <Button size="lg" className="bg-primary hover:bg-secondary text-white">
          Request Early Access
        </Button>
      </div>
    </section>
  );
};
