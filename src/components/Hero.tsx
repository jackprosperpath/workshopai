
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="flex flex-col items-center text-center py-32 px-8">
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Co-Create With Your Team & AI
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Turn every meeting into a powerful, AI-driven workshop that creates solutions, sparks meaningful discussions, and moves ideas to action—fast.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" variant="outline" className="hover:bg-accent/90">
              Try It Now
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-lg font-semibold text-primary">
          Experience the future of collaborative problem-solving
        </p>
      </div>
    </section>
  );
};
