
import React from "react";

// Optimized background animation for full page coverage
export const HeroBackgroundAnimation = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
    <svg
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Post-it shapes with reduced animation complexity - distributed across the full page */}
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
        <rect x="900" y="600" width="75" height="75" rx="10" fill="#FEF7CD" opacity="0.7">
          <animate 
            attributeName="y"
            values="600;590;600"
            dur="11s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="300" y="700" width="65" height="65" rx="10" fill="#FEF7CD" opacity="0.6">
          <animate 
            attributeName="y"
            values="700;710;700"
            dur="9s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="1100" y="300" width="55" height="55" rx="8" fill="#FEF7CD" opacity="0.5">
          <animate 
            attributeName="y"
            values="300;295;300"
            dur="7s"
            repeatCount="indefinite"
          />
        </rect>
      </g>
      
      {/* AI "spark" animations - expanded across the page */}
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
        <circle cx="420" cy="320" r="7" fill="#D946EF" opacity="0.1">
          <animate 
            attributeName="r"
            values="7;9;7"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="1050" cy="420" r="6" fill="#8B5CF6" opacity="0.09">
          <animate 
            attributeName="r"
            values="6;8;6"
            dur="9s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="320" cy="680" r="5" fill="#0EA5E9" opacity="0.1">
          <animate 
            attributeName="r"
            values="5;7;5"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      
      {/* Dashed lines (connections) expanded across the page */}
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
      <path
        d="M350 580 Q620 520 900 630"
        stroke="#0EA5E9"
        strokeWidth="1.5"
        strokeDasharray="7"
        opacity="0.1"
      />
      <path
        d="M950 320 Q750 450 480 400"
        stroke="#8B5CF6"
        strokeWidth="1.5"
        strokeDasharray="5"
        opacity="0.1"
      />
      
      {/* Team "pointer" dots expanded across the page */}
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
        <circle cx="520" cy="580" r="6" fill="#D946EF" opacity="0.13">
          <animate
            attributeName="cx"
            values="520;530;520"
            dur="10s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="980" cy="450" r="5" fill="#8B5CF6" opacity="0.11">
          <animate
            attributeName="cy"
            values="450;440;450"
            dur="7s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  </div>
);
