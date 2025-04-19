
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="flex flex-col items-center text-center py-32 px-8">
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          AI COLLABORATION <span className="relative text-primary">
            REIMAGINED
            <span className="absolute inset-x-0 bottom-2 h-3 bg-primary/20 -z-10 rounded"></span>
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Unleash your team's creative potential with AI-powered collaborative workshops that transform ideas into breakthrough solutions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" variant="outline" className="hover:bg-secondary/10">
              Try It Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
