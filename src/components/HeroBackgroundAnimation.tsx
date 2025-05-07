
import React from "react";

// Optimized background animation with reduced elements for better performance
export const HeroBackgroundAnimation = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
    <svg
      viewBox="0 0 1440 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Post-it shapes with reduced animation complexity */}
      <g>
        <rect x="200" y="90" width="70" height="70" rx="10" fill="#FEF7CD" opacity="0.7">
          <animate 
            attributeName="y"
            values="90;80;90"
            dur="8s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="1240" y="120" width="60" height="60" rx="9" fill="#FEF7CD" opacity="0.6">
          <animate 
            attributeName="y"
            values="120;110;120"
            dur="9s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="400" y="400" width="80" height="60" rx="10" fill="#FEF7CD" opacity="0.6">
          <animate 
            attributeName="y"
            values="400;410;400"
            dur="10s"
            repeatCount="indefinite"
          />
        </rect>
      </g>
      
      {/* Simplified AI "spark" animations */}
      <g>
        <circle cx="720" cy="120" r="8" fill="#8B5CF6" opacity="0.12">
          <animate 
            attributeName="r"
            values="8;10;8"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="780" cy="170" r="5" fill="#0EA5E9" opacity="0.11">
          <animate 
            attributeName="r"
            values="5;7;5"
            dur="7s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      
      {/* Reduced and optimized dashed lines (connections) */}
      <path
        d="M250 120 Q400 240 650 150"
        stroke="#9B87F5"
        strokeWidth="1.5"
        strokeDasharray="6"
        opacity="0.1"
      />
      <path
        d="M780 180 Q1050 230 1280 150"
        stroke="#D946EF"
        strokeWidth="1.5"
        strokeDasharray="8"
        opacity="0.1"
      />
      
      {/* Team "pointer" dots with simpler animations */}
      <g>
        <circle cx="340" cy="140" r="6" fill="#8B5CF6" opacity="0.14">
          <animate
            attributeName="cx"
            values="340;350;340"
            dur="9s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="1228" cy="170" r="6" fill="#0EA5E9" opacity="0.12">
          <animate
            attributeName="cy"
            values="170;160;170"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  </div>
);
