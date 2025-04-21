
import { Users, FileText, Video, Zap } from "lucide-react";
import SlackLogo from "./SlackLogo";

export const LogoStrip = () => {
  const logos = [
    {
      name: "Zoom",
      icon: <Video className="h-10 w-auto opacity-70" aria-label="Zoom logo" />,
      url: "https://zoom.us/",
    },
    {
      name: "Slack",
      icon: <SlackLogo className="h-10 w-auto opacity-70" />,
      url: "https://slack.com/",
    },
    {
      name: "Teams",
      icon: <Users className="h-10 w-auto opacity-70" aria-label="Teams logo" />,
      url: "https://www.microsoft.com/en/microsoft-teams/group-chat-software",
    },
    {
      name: "Notion",
      icon: <FileText className="h-10 w-auto opacity-70" aria-label="Notion logo" />,
      url: "https://www.notion.so/",
    },
    {
      name: "Zapier",
      icon: <Zap className="h-10 w-auto opacity-70" aria-label="Zapier logo" />,
      url: "https://zapier.com/",
    },
  ];

  return (
    <section
      id="integrations"
      className="py-12 px-8"
      aria-label="Logos of integrated applications"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
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
