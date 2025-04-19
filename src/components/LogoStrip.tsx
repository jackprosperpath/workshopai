
export const LogoStrip = () => {
  const logos = [
    { name: "OpenAI", url: "https://dummyimage.com/120x40/ffffff/000000?text=OpenAI" },
    { name: "Slack", url: "https://dummyimage.com/120x40/ffffff/000000?text=Slack" },
    { name: "Teams", url: "https://dummyimage.com/120x40/ffffff/000000?text=Teams" },
    { name: "Notion", url: "https://dummyimage.com/120x40/ffffff/000000?text=Notion" },
    { name: "Zapier", url: "https://dummyimage.com/120x40/ffffff/000000?text=Zapier" },
  ];

  return (
    <section id="integrations" className="py-12 px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
        {logos.map((logo) => (
          <img
            key={logo.name}
            src={logo.url}
            alt={`${logo.name} logo`}
            className="h-10 opacity-70"
          />
        ))}
      </div>
    </section>
  );
};
