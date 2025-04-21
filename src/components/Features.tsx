
import { Users, History, ThumbsUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    name: "Real-time Collaboration",
    description: "Work together seamlessly with your team in real-time on AI prompts and solutions.",
    icon: Users,
  },
  {
    name: "Version History",
    description: "Track changes and iterate on prompts with comprehensive version control.",
    icon: History,
  },
  {
    name: "Stakeholder Approval",
    description: "Streamline sign-offs with built-in approval workflows.",
    icon: ThumbsUp,
  },
  {
    name: "Instant Iterations",
    description: "Refine and improve prompts quickly with immediate AI feedback.",
    icon: Zap,
  },
];

export const Features = () => {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Why Teams Love WorkshopAI
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Generate a solution, debate it together, and walk out with an endorsed deliverable&nbsp;&mdash;&nbsp;all in under an hour.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
            {features.map((feature) => (
              <Card key={feature.name} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 text-secondary" />
                  <h3 className="mt-6 font-display text-xl font-semibold leading-7 text-primary">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

