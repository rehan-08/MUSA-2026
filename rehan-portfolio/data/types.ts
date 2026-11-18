export type VisualKey = "samudra" | "geomonitor" | "safecity" | "tripcap";

export interface ArchitectureStep {
  label: string;
  detail?: string;
}

export interface ImplementationBlock {
  title: string;
  body: string;
  steps?: string[];
  items?: { name: string; note: string }[];
}

export interface DemoSlot {
  label: string;
  kind: "photo" | "screenshot" | "video" | "link";
  /** Path under /public. When empty the slot renders as a marked placeholder. */
  src?: string;
  href?: string;
}

export interface Project {
  slug: string;
  number: string;
  name: string;
  category: string;
  summary: string;
  tags: string[];
  visual: VisualKey;
  /** Short factual badge shown on the card, only for verified claims. */
  badge?: string;
  links: { github?: string; demo?: string; live?: string };
  sections: {
    overview: string[];
    problem: string[];
    approach: string[];
    architecture: { intro: string; steps: ArchitectureStep[] };
    technology: { group: string; items: string[] }[];
    implementation: ImplementationBlock[];
    challenges: { title: string; body: string }[];
    results: { statement: string; verified: boolean; notes?: string[] };
    demo: DemoSlot[];
    future: string[];
  };
}

export interface Experiment {
  name: string;
  kind: string;
  blurb: string;
  tags: string[];
}

export interface LogEntry {
  slug: string;
  /** ISO-ish date string. Leave undefined until the real date is known. */
  date?: string;
  title: string;
  category: string;
  summary: string;
  body: string[];
}
