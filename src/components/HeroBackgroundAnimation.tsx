
import React from "react";

// Improved animated SVG: post-its morph (scale/rotate), animated cursor, vivid sparks, moving collab lines.
// All colors are soft, animations are subtle and looping.

export const HeroBackgroundAnimation = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none">
    <svg
      viewBox="0 0 1440 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Morphing Post-its (with color/scale/rotation) */}
      <g>
        <rect x="200" y="90" width="70" height="70" rx="10">
          <animateTransform attributeName="transform" type="rotate"
            from="0 235 125" to="6 235 125"
            dur="10s" repeatCount="indefinite" />
          <animate attributeName="fill"
            values="#FDE1D3;#FFDEE2;#D6BCFA;#FDE1D3"
            dur="14s" repeatCount="indefinite" />
          <animate attributeName="opacity"
            values="0.58;0.63;0.56;0.58"
            dur="9s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="scale"
            additive="sum"
            values="1 1;1.09 1.04;1 1"
            keyTimes="0;0.5;1"
            begin="0s"
            dur="9s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="1240" y="120" width="60" height="60" rx="9">
          <animateTransform attributeName="transform" type="rotate"
            from="0 1270 150" to="-7 1270 150"
            dur="13s" repeatCount="indefinite" />
          <animate attributeName="fill"
            values="#E5DEFF;#D3E4FD;#FFDEE2;#E5DEFF"
            dur="12s" repeatCount="indefinite" />
          <animate attributeName="opacity"
            values="0.51;0.59;0.54;0.51"
            dur="10s" repeatCount="indefinite" />
        </rect>
        <rect x="400" y="400" width="80" height="60" rx="10">
          <animateTransform attributeName="transform" type="rotate"
            from="0 440 430" to="12 440 430"
            dur="8s" repeatCount="indefinite" />
          <animate attributeName="fill"
            values="#FEC6A1;#FEF7CD;#F2FCE2;#FEC6A1"
            dur="13s" repeatCount="indefinite" />
          <animate attributeName="opacity"
            values="0.60;0.64;0.55;0.60"
            dur="10s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="scale"
            additive="sum"
            values="1 1;1.06 1.1;1 1"
            keyTimes="0;0.6;1"
            begin="0s"
            dur="10s"
            repeatCount="indefinite"
          />
        </rect>
      </g>

      {/* Animated Cursor Editing Line (team) */}
      <g>
        {/* Cursor trail */}
        <polyline 
          points="620,270 670,210 720,160"
          stroke="#8B5CF6"
          strokeWidth="4"
          fill="none"
          opacity="0.07">
          <animate attributeName="points"
            values="
              620,270 670,210 720,160;
              660,260 710,190 770,150;
              620,270 670,210 720,160
            "
            dur="7s"
            repeatCount="indefinite"
          />
        </polyline>
        {/* Cursor head */}
        <rect x="716" y="156" width="15" height="14" rx="4"
          fill="#8B5CF6" opacity="0.18"
        >
          <animate
            attributeName="x"
            values="716;766;716"
            dur="7s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="156;146;156"
            dur="7s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="803" y="137" width="9" height="14" rx="2"
          fill="#0EA5E9" opacity="0.12">
          <animate
            attributeName="x"
            values="803;853;803"
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="137;157;137"
            dur="10s"
            repeatCount="indefinite"
          />
        </rect>
      </g>

      {/* Enhanced AI Sparks With Burst and Float */}
      <g>
        <circle cx="770" cy="120" r="15" fill="#8B5CF6" opacity="0.08">
          <animate attributeName="cy" values="120;140;120" dur="8s" repeatCount="indefinite" />
          <animate attributeName="r" values="15;23;15" dur="2.3s" repeatCount="indefinite" />
        </circle>
        {/* Burst effect (animated element radiating out and fading quickly) */}
        <circle cx="770" cy="120" r="4" fill="#FFE066">
          <animate attributeName="r" values="4;15;4" dur="1.75s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0" dur="1.75s" repeatCount="indefinite" />
        </circle>
        <circle cx="870" cy="180" r="10" fill="#0EA5E9" opacity="0.11">
          <animate attributeName="cy" values="180;160;180" dur="9s" repeatCount="indefinite" />
        </circle>
        <circle cx="660" cy="170" r="7" fill="#D946EF" opacity="0.14">
          <animate attributeName="cy" values="170;200;170" dur="7s" repeatCount="indefinite" />
          <animate attributeName="r" values="7;14;7" dur="4.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Bouncing Collab Dashed Lines */}
      <g>
        <path
          d="M250 120 Q400 240 650 150"
          stroke="#9B87F5"
          strokeWidth="2"
          strokeDasharray="9"
          opacity="0.14">
          <animate
            attributeName="d"
            values="
              M250 120 Q400 240 650 150;
              M250 120 Q389 256 670 180;
              M250 120 Q400 240 650 150
            "
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke"
            values="#9B87F5;#D946EF;#8B5CF6;#9B87F5"
            dur="15s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M780 180 Q1050 230 1280 150"
          stroke="#D946EF"
          strokeWidth="2"
          strokeDasharray="11"
          opacity="0.12">
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
      </g>

      {/* Animated Team "pointer" dots */}
      <g>
        <circle cx="360" cy="135" r="10" fill="#8B5CF6" opacity="0.15">
          <animate attributeName="cy" values="135;155;135" dur="7s" repeatCount="indefinite" />
          <animate attributeName="r" values="10;13;10" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="1228" cy="170" r="10" fill="#0EA5E9" opacity="0.13">
          <animate attributeName="cy" values="170;150;170" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="430" cy="430" r="7" fill="#9B87F5" opacity="0.14">
          <animate attributeName="cy" values="430;410;430" dur="8s" repeatCount="indefinite" />
        </circle>
        {/* Add faint pulse for focus */}
        <circle cx="440" cy="160" r="3" fill="#8B5CF6" opacity="0.10">
          <animate attributeName="r" values="3;10;3" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.10;0.03;0.10" dur="6s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  </div>
);
