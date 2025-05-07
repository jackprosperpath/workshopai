
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { HeroBackgroundAnimation } from "./HeroBackgroundAnimation";

export const Hero = () => {
  return (
    <section className="relative flex flex-col items-center text-center py-32 px-8 overflow-hidden">
      {/* Full-page animated background behind everything else */}
      <HeroBackgroundAnimation />
      <div className="max-w-3xl relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Co-create with your team & AI
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Turn every meeting into an AI-powered workshop that sparks meaningful discussion and gets you from ideas to action quickly
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" variant="outline" className="hover:bg-accent/90">
              Try It Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
