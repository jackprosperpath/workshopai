
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import PostItBackground from "./PostItBackground";

export const Hero = () => {
  return (
    <section className="relative flex flex-col items-center text-center py-32 px-8 overflow-hidden">
      {/* Lo-fi Post-it animated background behind everything else */}
      <PostItBackground />
      <div className="max-w-3xl relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Instantly Generate AI Meeting Blueprints
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Get AI-powered blueprints for any meeting. Simply add agenda@teho.ai to your calendar invite or create one manually.
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

