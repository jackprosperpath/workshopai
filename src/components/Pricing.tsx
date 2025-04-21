
import { Check } from "lucide-react";
import { Button } from "./ui/button";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for trying out Converge.ai",
    features: [
      "Up to 5 team members",
      "3 AI models",
      "Basic collaboration tools",
      "Community support"
    ],
  },
  {
    name: "Pro",
    price: "$49",
    description: "Best for growing teams",
    features: [
      "Up to 20 team members",
      "10 AI models",
      "Advanced collaboration",
      "Priority support",
      "Analytics dashboard"
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited team members",
      "Custom AI model integration",
      "Advanced security",
      "Dedicated support",
      "Custom analytics",
      "SLA guarantee"
    ],
  }
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Simple, <span className="text-primary">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that best suits your team's needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => (
            <div key={tier.name} className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.price !== "Custom" && <span className="text-gray-600">/month</span>}
              </div>
              <p className="text-gray-600 mb-6">{tier.description}</p>
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-primary hover:bg-secondary text-white">
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
