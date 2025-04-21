
import React from "react";

// Very subtle animated SVGs illustrating post-its morphing, AI sparks, and team pointers.
export const HeroBackgroundAnimation = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
    <svg
      viewBox="0 0 1440 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Animated Post-it/Note shapes */}
      <g className="animate-[fade-up_6s_ease-in-out_infinite_alternate]">
        <rect x="200" y="90" width="70" height="70" rx="10" fill="#FDE1D3" opacity="0.6">
          <animate 
            attributeName="y"
            values="90;70;90"
            dur="6s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="1240" y="120" width="60" height="60" rx="9" fill="#E5DEFF" opacity="0.5">
          <animate 
            attributeName="y"
            values="120;100;120"
            dur="7s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="400" y="400" width="80" height="60" rx="10" fill="#FEC6A1" opacity="0.55">
          <animate 
            attributeName="y"
            values="400;420;400"
            dur="8s"
            repeatCount="indefinite"
          />
        </rect>
      </g>
      {/* Animated "spark" for AI */}
      <g>
        <circle cx="720" cy="120" r="12" fill="#8B5CF6" opacity="0.14">
          <animate 
            attributeName="cy"
            values="120;140;120"
            dur="5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="820" cy="170" r="7" fill="#0EA5E9" opacity="0.13">
          <animate 
            attributeName="cy"
            values="170;150;170"
            dur="7s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="670" cy="170" r="6" fill="#D946EF" opacity="0.12">
          <animate 
            attributeName="cy"
            values="170;190;170"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      {/* Dashed lines ("connections"/collab paths) */}
      <path
        d="M250 120 Q400 240 650 150"
        stroke="#9B87F5"
        strokeWidth="2"
        strokeDasharray="6"
        opacity="0.15"
      >
        <animate
          attributeName="d"
          values="
            M250 120 Q400 240 650 150;
            M250 120 Q390 250 650 170;
            M250 120 Q400 240 650 150
          "
          dur="10s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M780 180 Q1050 230 1280 150"
        stroke="#D946EF"
        strokeWidth="2"
        strokeDasharray="8"
        opacity="0.12"
      >
        <animate
          attributeName="d"
          values="
            M780 180 Q1050 230 1280 150;
            M790 170 Q1100 260 1265 175;
            M780 180 Q1050 230 1280 150
          "
          dur="11s"
          repeatCount="indefinite"
        />
      </path>
      {/* Team "pointer" dots */}
      <g>
        <circle cx="340" cy="140" r="8" fill="#8B5CF6" opacity="0.16">
          <animate
            attributeName="cx"
            values="340;370;340"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="1228" cy="170" r="8" fill="#0EA5E9" opacity="0.13">
          <animate
            attributeName="cy"
            values="170;150;170"
            dur="7s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="430" cy="430" r="6" fill="#9b87f5" opacity="0.14">
          <animate
            attributeName="cy"
            values="430;410;430"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  </div>
);

