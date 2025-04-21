
import * as React from "react";

const SlackLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 122.8 122.8"
    aria-label="Slack logo"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <rect width="122.8" height="122.8" rx="30" fill="#fff"/>
    <g>
      <path fill="#36C5F0" d="M49 76.5a6.1 6.1 0 1 1-12.2 0v-30.2a6.1 6.1 0 1 1 12.2 0z"/>
      <path fill="#36C5F0" d="M42.9 85.4A6.1 6.1 0 1 1 30.7 79.2a6.1 6.1 0 0 1 12.2 0z"/>
      <path fill="#2EB67D" d="M46.3 49a6.1 6.1 0 0 1 0-12.2h30.2a6.1 6.1 0 0 1 0 12.2z"/>
      <path fill="#2EB67D" d="M37.4 42.9a6.1 6.1 0 1 1 6.1-12.2 6.1 6.1 0 0 1-6.1 12.2z"/>
      <path fill="#ECB22E" d="M73.8 46.3a6.1 6.1 0 1 1 12.2 0v30.2a6.1 6.1 0 1 1-12.2 0z"/>
      <path fill="#ECB22E" d="M79.9 37.4a6.1 6.1 0 1 1 12.2 6.1 6.1 0 0 1-12.2-6.1z"/>
      <path fill="#E01E5A" d="M76.5 73.8a6.1 6.1 0 0 1 0 12.2H46.3a6.1 6.1 0 1 1 0-12.2z"/>
      <path fill="#E01E5A" d="M85.4 79.9a6.1 6.1 0 1 1-6.1 12.2 6.1 6.1 0 0 1 6.1-12.2z"/>
    </g>
  </svg>
);

export default SlackLogo;
