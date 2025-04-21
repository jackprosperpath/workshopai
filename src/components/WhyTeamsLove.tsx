
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

// Helper to randomize card styles
function pickCardStyle(index: number) {
  const color = postItColors[index % postItColors.length];
  const rotations = [-5, 4, -3, 3, -2, 2];
  const rotate = rotations[index % rotations.length];
  return { background: color, rotate };
}

const features = [
  {
    title: "Generate a solution, debate it together, and walk out with an endorsed deliverable — all in under an hour.",
    important: true,
  },
  {
    title: "AI-Driven Solution Drafts",
    description: "Quickly turn ideas into structured, ready-to-share documents.",
  },
  {
    title: "Real-Time Collaboration",
    description: "Edit, comment, and iterate together, seamlessly.",
  },
];

export const WhyTeamsLove = () => (
  <section className="py-24 bg-white relative overflow-x-clip">
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
          Why Teams <span className="text-primary">Love WorkshopAI</span>
        </h2>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto relative z-10">
        {features.map((feature, idx) => {
          const { background, rotate } = pickCardStyle(idx);
          return (
            <div
              key={feature.title}
              className={`relative group transition-transform duration-200 flex-1 min-w-[260px]`}
              style={{ transform: `rotate(${rotate}deg)` }}
            >
              {/* Sticky tape */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-16 h-4 bg-yellow-200 rounded-b shadow-md opacity-70"
                style={{ clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)" }}
              />
              <div
                className={`
                  rounded-[0.8rem] shadow-xl border border-gray-200
                  transition-shadow duration-200 hover:shadow-2xl hover-scale
                  before:content-[''] before:absolute before:w-8 before:h-2 before:bg-white before:opacity-60
                  before:rounded-bl-xl before:top-0 before:right-6
                `}
                style={{
                  background,
                  minHeight: feature.important ? 220 : 180,
                  padding: feature.important ? "2.2rem 1.5rem" : "1.5rem 1rem",
                  position: "relative",
                  zIndex: 10,
                  fontSize: feature.important ? "1.14rem" : "",
                  fontWeight: feature.important ? 500 : 400,
                  boxShadow: feature.important
                    ? "0 12px 32px 0 rgba(0,0,0,.11), 0 2px 8px rgba(0,0,0,.09)"
                    : undefined,
                }}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className={feature.important
                      ? "mb-2 font-semibold text-gray-900"
                      : "font-bold text-lg mb-2 text-gray-900"}>
                      {feature.title}
                    </div>
                    {feature.description && (
                      <div className="text-gray-800">{feature.description}</div>
                    )}
                  </div>
                </div>
              </div>
              {/* Drop shadow for extra pop */}
              <div className="absolute inset-0 rounded-[0.8rem] z-0 pointer-events-none"
                style={{
                  boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)"
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

