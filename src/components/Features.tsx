import { Users, History, ThumbsUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

// Pastel "post-it" colors from hero background
const postItColors = ["#FEF7CD",
// soft yellow
"#F2FCE2",
// soft green
"#E5DEFF",
// soft purple
"#FFDEE2",
// soft pink
"#FDE1D3",
// peach
"#D3E4FD",
// soft blue
"#FEC6A1" // soft orange
];

// Small random utility to assign color/rotation to each card deterministically
const featureDecor = [{
  color: postItColors[0],
  rotate: -4
}, {
  color: postItColors[1],
  rotate: 3
}, {
  color: postItColors[2],
  rotate: 6
}, {
  color: postItColors[4],
  rotate: -7
}];
const features = [{
  name: "AI-Driven Solution Drafts",
  description: "Quickly turn ideas into structured, ready-to-share documents.",
  icon: Zap
}, {
  name: "Real-Time Collaboration",
  description: "Edit, comment, and iterate together, seamlessly.",
  icon: Users
}, {
  name: "Intelligent Discussion Prompts",
  description: "AI-generated questions guide impactful team conversations.",
  icon: History
}, {
  name: "Integrated Stakeholder Approval",
  description: "Smoothly manage feedback and secure approvals directly within the platform.",
  icon: ThumbsUp
}];
export const Features = () => {
  return <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-10 text-center text-xl font-semibold text-primary">
          Experience the future of collaborative problem-solving
        </p>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">Why Teams Love teho.ai</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Generate a solution, debate it together, and walk out with an endorsed deliverable&nbsp;&mdash;&nbsp;all in under an hour.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
            {features.map((feature, i) => {
            const decor = featureDecor[i % featureDecor.length];
            return <Card key={feature.name} className={`
                    border-0 shadow-xl transition-transform hover:scale-105 hover:-translate-y-2
                    rounded-[14px] 
                    animate-fade-in
                  `} style={{
              background: decor.color,
              transform: `rotate(${decor.rotate}deg)`,
              boxShadow: "0px 6px 24px 0px rgba(31, 41, 55, 0.09), 0 1.5px 0 0 rgba(143, 143, 143, 0.01)"
            }}>
                  <CardContent className="pt-6 pb-7 flex flex-col items-center min-h-[270px]">
                    <span className="w-12 h-12 flex items-center justify-center rounded-md mb-4" style={{
                  background: "rgba(255,255,255,0.6)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
                  border: "1.5px dashed #fff4"
                }}>
                      <feature.icon className="h-8 w-8 text-secondary" />
                    </span>
                    <h3 className="mt-1 font-display text-xl font-semibold leading-7 text-primary text-center">
                      {feature.name}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-gray-700 text-center">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>
      </div>
    </div>;
};