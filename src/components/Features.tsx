
import { Users, History, ThumbsUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    name: "AI-Driven Solution Drafts",
    description: "Quickly turn ideas into structured, ready-to-share documents.",
    icon: Zap,
  },
  {
    name: "Real-Time Collaboration",
    description: "Edit, comment, and iterate together, seamlessly.",
    icon: Users,
  },
  {
    name: "Intelligent Discussion Prompts",
    description: "AI-generated questions guide impactful team conversations.",
    icon: History,
  },
  {
    name: "Integrated Stakeholder Approval",
    description: "Smoothly manage feedback and secure approvals directly within the platform.",
    icon: ThumbsUp,
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

