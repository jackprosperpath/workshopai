
import { useMemo } from "react";

type Note = { left: string; top: string; delay: string; hue: number; rotate: number };

export default function PostItBackground() {
  // create 20 randomised "Post-it" notes – stable across renders
  const notes: Note[] = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        hue: Math.floor(40 + Math.random() * 40), // pastel yellows-greens
        rotate: Math.random() * 12 - 6, // slight tilt between -6 to +6 deg
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {notes.map((n, i) => (
        <span
          key={i}
          className="block absolute w-24 h-24 rounded shadow-md opacity-0 animate-postit"
          style={{
            left: n.left,
            top: n.top,
            animationDelay: n.delay,
            backgroundColor: `hsl(${n.hue} 85% 80%)`,
            transform: `rotate(${n.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
