
import { Slack, Users } from "lucide-react";

// Add logo image imports
import ZoomLogo from "@/assets/logos/zoom.svg";
import NotionLogo from "@/assets/logos/notion.svg";

export const LogoStrip = () => {
  const logos = [
    {
      name: "Zoom",
      icon: (
        <img
          src={ZoomLogo}
          alt="Zoom logo"
          className="h-10 w-auto opacity-80"
          aria-label="Zoom logo"
        />
      ),
      url: "https://zoom.us/",
    },
    {
      name: "Slack",
      icon: <Slack className="h-10 w-auto opacity-70" aria-label="Slack logo" />,
      url: "https://slack.com/",
    },
    {
      name: "Teams",
      icon: <Users className="h-10 w-auto opacity-70" aria-label="Teams logo" />,
      url: "https://www.microsoft.com/en/microsoft-teams/group-chat-software",
    },
    {
      name: "Notion",
      icon: (
        <img
          src={NotionLogo}
          alt="Notion logo"
          className="h-10 w-auto opacity-80"
          aria-label="Notion logo"
        />
      ),
      url: "https://www.notion.so/",
    },
  ];

  return (
    <section
      id="integrations"
      className="py-12 px-8"
      aria-label="Logos of Zoom, Slack, Teams, and Notion"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center">
        {logos.map((logo) => (
          <a
            key={logo.name}
            href={logo.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={logo.name}
            className="flex items-center justify-center"
          >
            {logo.icon}
          </a>
        ))}
      </div>
    </section>
  );
};
