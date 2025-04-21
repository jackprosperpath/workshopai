
import { ArrowRight } from "lucide-react";
import React from "react";

// Pastel post-it colors
const postItColors = [
  "#FEF7CD", // yellow
  "#F2FCE2", // soft green
  "#D3E4FD", // blue
  "#FDE1D3", // peach
  "#E5DEFF", // purple
  "#FFDEE2", // pink
];

// Helper to randomize card styles (for each card index, a deterministic but "random enough" pick)
function pickCardStyle(index: number) {
  const color = postItColors[index % postItColors.length];
  // Alternate small rotations: -3, 2, -2, 3, -1, 1 deg
  const rotations = [-3, 2, -2, 3, -1, 1];
  const rotate = rotations[index % rotations.length];
  return { background: color, rotate };
}

const steps = [
  {
    number: "01",
    title: "Define Your Challenge",
    description:
      "Clearly outline your problem, objectives, and constraints - WorkshopAI structures it all effortlessly.",
  },
  {
    number: "02",
    title: "Generate Instant Solutions",
    description:
      "Tap into cutting-edge AI models to instantly draft comprehensive, structured solutions tailored to your goals.",
  },
  {
    number: "03",
    title: "Facilitate Engaging Discussions",
    description:
      "Automatically-generated, thought-provoking prompts guide your team’s conversation, ensuring everyone contributes valuable insights.",
  },
  {
    number: "04",
    title: "Refine, Iterate, Approve",
    description:
      "Real-time collaboration tools help you quickly iterate and refine until your team and stakeholders are aligned.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-gray-50 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg text-gray-600">
            Get from idea to implementation in four simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const { background, rotate } = pickCardStyle(index);
            return (
              <div
                key={step.number}
                className="relative group transition-transform duration-200"
                style={{
                  transform: `rotate(${rotate}deg)`,
                }}
              >
                <div
                  className={`
                    rounded-[0.7rem] shadow-xl transition-shadow duration-200
                    hover:shadow-2xl hover-scale
                    border border-gray-200
                    before:content-[''] before:absolute before:w-7 before:h-2 before:bg-white before:opacity-60
                    before:rounded-bl-xl before:top-0 before:right-6
                  `}
                  style={{
                    background: background,
                    minHeight: 330,
                    position: "relative",
                  }}
                >
                  <div className="p-6">
                    <div className="text-4xl font-bold text-black opacity-20 mb-4">{step.number}</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                    <p className="text-gray-800">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-6 text-gray-300 transform -translate-y-1/2 z-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
