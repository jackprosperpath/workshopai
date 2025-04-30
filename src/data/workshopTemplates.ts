
import { WorkshopTemplate } from "@/types/WorkshopTemplates";

export const WORKSHOP_TEMPLATES: Record<string, WorkshopTemplate> = {
  "sprint-retro": {
    id: "sprint-retro",
    name: "Sprint Retro 2.0",
    description: "Analyze the last iteration, surface wins & pains, decide actions",
    purpose: "Reflect on past sprint performance and plan improvements",
    duration: 60,
    aiFeatures: [
      "Real-time sentiment heat-map on topics",
      "AI clusters feedback stickies into themes",
      "\"Insight Booster\" button generates probing questions"
    ],
    idealFor: ["Scrum Masters", "Agile Teams", "Product Managers"],
    valueProposition: "Saves facilitator prep; instant theme clustering feels \"magical\""
  },
  "lightning-design-sprint": {
    id: "lightning-design-sprint",
    name: "Lightning Design Sprint",
    description: "Rapidly prototype & test a concept in half a day",
    purpose: "Compress Google Ventures design sprint into 4 hours",
    duration: 240,
    aiFeatures: [
      "Blueprint auto-compresses GV sprint into 4 blocks",
      "AI generates user-test script & fake persona bios",
      "Instant storyboard panel using DALLE for mock screens"
    ],
    idealFor: ["Product Designers", "UX Teams", "Innovation Leads"],
    valueProposition: "Turns a normally 5-day process into half-day with AI assets"
  },
  "okr-kickoff": {
    id: "okr-kickoff",
    name: "OKR Kick-off Canvas",
    description: "Align team on Objectives & Key Results for a quarter",
    purpose: "Set and align on quarterly OKRs",
    duration: 90,
    aiFeatures: [
      "AI converts mission + metrics into draft OKRs",
      "Confidence / impact slider voting",
      "Automatic guard-rail check for measurability"
    ],
    idealFor: ["Leadership Teams", "Department Heads", "Team Leads"],
    valueProposition: "Drafts the boring part and ensures SMART criteria; leadership loves it"
  },
  "pre-mortem": {
    id: "pre-mortem",
    name: "Pre-Mortem Planner",
    description: "Anticipate project failure modes before launch",
    purpose: "Identify and mitigate potential project risks",
    duration: 75,
    aiFeatures: [
      "AI suggests common risks based on project brief",
      "Monte-Carlo style risk radar visual",
      "Decision matrix auto-fills mitigation owners"
    ],
    idealFor: ["Project Managers", "Risk Analysts", "Product Teams"],
    valueProposition: "Risk workshops often stall; AI seeds the scary scenarios instantly"
  },
  "story-mapping": {
    id: "story-mapping",
    name: "Story-Mapping Express",
    description: "Slice MVP into releases & user journeys",
    purpose: "Create and prioritize user stories for product backlog",
    duration: 120,
    aiFeatures: [
      "Live wall with draggable AI-generated user stories",
      "Priority heat-map (value × effort) auto-colouring",
      "Export to Jira backlog"
    ],
    idealFor: ["Product Owners", "Development Teams", "Business Analysts"],
    valueProposition: "Manual story writing is slog—AI pre-seeds backlog, users edit not write"
  },
  "north-star": {
    id: "north-star",
    name: "North-Star Narrative Lab",
    description: "Craft compelling product vision & metrics",
    purpose: "Define product vision and key success metrics",
    duration: 90,
    aiFeatures: [
      "GPT-writer produces first-pass \"North-Star statement\"",
      "Competitive benchmark cards auto-pulled",
      "Consensus timer to push toward single metric"
    ],
    idealFor: ["Product Leaders", "Strategy Teams", "Executives"],
    valueProposition: "Strategy workshops often drift; AI anchors narrative quickly"
  },
  "team-charter": {
    id: "team-charter",
    name: "Team Charter Builder",
    description: "Define roles, rituals, working agreements",
    purpose: "Create team working agreements and expectations",
    duration: 60,
    aiFeatures: [
      "AI surfaces sample charters from similar teams",
      "Conflict-scenario simulations (\"What if...\")",
      "Outputs printable charter doc + Slack summary"
    ],
    idealFor: ["New Teams", "Team Leads", "HR Facilitators"],
    valueProposition: "HR loves formal charters but teams skip them—this makes it fun & fast"
  },
  "customer-journey": {
    id: "customer-journey",
    name: "Customer Journey Deep-Dive",
    description: "Map end-to-end user experience & pain points",
    purpose: "Create detailed customer journey maps with insights",
    duration: 120,
    aiFeatures: [
      "Sentiment analysis on uploaded NPS/CSAT feedback",
      "AI auto-creates touchpoint cards",
      "Gap-highlight overlay"
    ],
    idealFor: ["CX Teams", "Product Managers", "Service Designers"],
    valueProposition: "Data-driven mapping normally takes days; AI crunches feedback live"
  },
  "lean-canvas": {
    id: "lean-canvas",
    name: "Lean Canvas Turbo",
    description: "Validate startup idea on one page",
    purpose: "Quickly validate and document business ideas",
    duration: 45,
    aiFeatures: [
      "Auto-populate competitors & costs from web scrape",
      "AI challenge bot questions weak assumptions",
      "Investor-ready PDF export"
    ],
    idealFor: ["Founders", "Entrepreneurs", "Innovation Teams"],
    valueProposition: "Founders save research time; exported canvas is share-ready"
  },
  "decision-jam": {
    id: "decision-jam",
    name: "Decision Jam AI",
    description: "Quick problem-solving ritual (inspired by AJ&Smart)",
    purpose: "Facilitate rapid decision-making sessions",
    duration: 40,
    aiFeatures: [
      "Lightning prompts adjust based on timer lag",
      "Automatic vote-tally & priority scoring",
      "Generates action list with owners & due dates"
    ],
    idealFor: ["Team Leaders", "Facilitators", "Project Managers"],
    valueProposition: "Proven format plus automation = irresistible for agencies"
  }
};

export const TEMPLATE_CATEGORIES: Record<string, WorkshopTemplate[]> = {
  agile: [WORKSHOP_TEMPLATES["sprint-retro"], WORKSHOP_TEMPLATES["story-mapping"]],
  design: [WORKSHOP_TEMPLATES["lightning-design-sprint"], WORKSHOP_TEMPLATES["customer-journey"]],
  strategy: [WORKSHOP_TEMPLATES["north-star"], WORKSHOP_TEMPLATES["pre-mortem"]],
  team: [WORKSHOP_TEMPLATES["team-charter"], WORKSHOP_TEMPLATES["okr-kickoff"]],
  product: [WORKSHOP_TEMPLATES["lean-canvas"], WORKSHOP_TEMPLATES["decision-jam"]]
};
