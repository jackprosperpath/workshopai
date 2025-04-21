
import { Star } from "lucide-react";

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
  // Playful rotations: -6, 3, -4, 5, -2, 2 deg
  const rotations = [-6, 3, -4, 5, -2, 2];
  const rotate = rotations[index % rotations.length];
  return { background: color, rotate };
}

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
    <section className="py-24 bg-white relative overflow-x-clip">
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
          {testimonials.map((testimonial, index) => {
            const { background, rotate } = pickCardStyle(index);
            return (
              <div
                key={index}
                className="relative transition-transform duration-200 group"
                style={{ transform: `rotate(${rotate}deg)` }}
              >
                {/* Post-it sticky tape effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-20 h-4 bg-yellow-200 rounded-b shadow-md opacity-70" style={{clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)"}}/>
                <div
                  className={`
                    rounded-[0.7rem] shadow-xl transition-shadow duration-200
                    hover:shadow-2xl hover-scale border border-gray-200
                    before:content-[''] before:absolute before:w-8 before:h-2 before:bg-white before:opacity-60
                    before:rounded-bl-xl before:top-0 before:right-6
                  `}
                  style={{
                    background,
                    minHeight: 340,
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  <div className="p-6 pb-4 flex flex-col h-full">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <blockquote className="text-gray-800 mb-6 flex-1 leading-relaxed">{testimonial.quote}</blockquote>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-gray-600">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
                {/* Drop shadow for extra pop */}
                <div className="absolute inset-0 rounded-[0.7rem] z-0 pointer-events-none"
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
};

