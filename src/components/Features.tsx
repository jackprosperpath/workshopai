
import { Users, History, ThumbsUp, Zap } from "lucide-react";

const pastelColors = [
  "#F2FCE2", // soft green
  "#FEF7CD", // soft yellow
  "#FEC6A1", // soft orange
  "#E5DEFF", // soft purple
  "#FFDEE2", // soft pink
  "#FDE1D3", // soft peach
  "#D3E4FD", // soft blue
  "#F1F0FB", // soft gray
];

// Each feature gets a color in order (or random if more than the list)
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

function getRandomRotation(index: number) {
  // tilt cards slightly, alternating directions
  const tilts = [-6, 4, -3, 5, -5, 3, 2, -4];
  return tilts[index % tilts.length];
}

export const Features = () => {
  return (
    <div className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-10 text-center text-xl font-semibold text-primary">
          Experience the future of collaborative problem-solving
        </p>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Why Teams Love WorkshopAI
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Generate a solution, debate it together, and walk out with an endorsed deliverable&nbsp;&mdash;&nbsp;all in under an hour.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24 relative z-10">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
            {features.map((feature, i) => (
              <div
                key={feature.name}
                className={`
                  relative group
                  shadow-xl
                  hover:shadow-2xl
                  transform
                  hover:-translate-y-2
                  transition-all
                  duration-300
                  cursor-pointer
                  overflow-visible
                `}
                style={{
                  background: pastelColors[i % pastelColors.length],
                  borderRadius: "14px",
                  minHeight: 280,
                  rotate: `${getRandomRotation(i)}deg`,
                  boxShadow:
                    "0 9px 24px 2px rgba(110,68,255,0.08), 0 1.5px 8px 0px rgba(0,0,0,0.04)",
                }}
              >
                {/* Simulated "note" pin */}
                <span
                  className="absolute left-1/2 -top-4 z-10"
                  style={{
                    transform: "translateX(-50%)",
                  }}
                >
                  <span className="block w-6 h-6 rounded-full bg-gray-200 border border-gray-300 shadow-md"
                        style={{ boxShadow: "0 2px 6px 0 rgba(0,0,0,0.08)" }}
                  ></span>
                </span>
                <div className="flex flex-col items-center px-7 pt-10 pb-8">
                  <feature.icon className="h-12 w-12 text-secondary mb-4" />
                  <h3 className="mt-2 font-display text-xl font-semibold leading-7 text-primary text-center">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-gray-700 text-center">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Optional faint floating post-its in background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="hidden md:block absolute left-10 top-20 w-28 h-28 rotate-[4deg] rounded"
            style={{ background: pastelColors[2], opacity: 0.18, filter: "blur(2px)" }}/>
        <div className="hidden md:block absolute right-20 top-36 w-32 h-32 -rotate-[5deg] rounded"
            style={{ background: pastelColors[4], opacity: 0.14, filter: "blur(1.5px)" }}/>
        <div className="hidden md:block absolute left-2/3 bottom-8 w-24 h-24 rotate-2 rounded"
            style={{ background: pastelColors[6], opacity: 0.16, filter: "blur(1.5px)" }}/>
      </div>
    </div>
  );
};
