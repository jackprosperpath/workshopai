
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Converge.ai has transformed how our team works with AI models. The collaborative approach has increased our efficiency by 3x.",
    author: "Sarah Chen",
    role: "AI Product Manager",
    company: "TechCorp",
  },
  {
    quote: "The best tool we've found for getting everyone on the same page with AI development. It's become an essential part of our workflow.",
    author: "Michael Rodriguez",
    role: "Engineering Lead",
    company: "InnovateLab",
  },
  {
    quote: "Finally, a solution that brings together technical and non-technical team members in AI development. Game-changer!",
    author: "Emily Watson",
    role: "Operations Director",
    company: "FutureScale",
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Loved by <span className="text-primary">Teams</span>
          </h2>
          <p className="text-lg text-gray-600">
            Join hundreds of teams already using Converge.ai
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-8 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6">{testimonial.quote}</blockquote>
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
                <div className="text-sm text-gray-600">{testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
