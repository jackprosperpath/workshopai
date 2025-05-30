
import { ArrowRight } from "lucide-react";

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
    <section className="py-24 bg-gray-50">
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
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="bg-white rounded-lg p-6 shadow-lg h-full">
                <div className="text-4xl font-bold text-primary/20 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 text-gray-400 transform -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

