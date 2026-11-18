import type { Experiment, LogEntry } from "./types";

export const intro = {
  heading: "What I build",
  paragraphs: [
    "I enjoy taking problems that exist outside the classroom and turning them into working technical systems.",
    "My work spans artificial intelligence, data analytics, full-stack development, geospatial technology and IoT, with a focus on building solutions that can move beyond a prototype and toward real-world deployment.",
  ],
  pillars: [
    { index: "01", title: "AI / ML", text: "Models that classify, predict and support decisions." },
    { index: "02", title: "Data & Geospatial", text: "Spatial data, analytics and interactive maps." },
    { index: "03", title: "Full-Stack", text: "Dashboards and applications people actually use." },
    { index: "04", title: "IoT & Hardware", text: "Sensors and microcontrollers that touch the real world." },
  ],
};

export const experiments: Experiment[] = [
  {
    name: "MARLIN",
    kind: "Maritime intelligence dashboard",
    blurb: "A dry-bulk chartering and port intelligence dashboard for Indian trade, built for Smart India Hackathon.",
    tags: ["React", "TypeScript", "Three.js", "MapLibre"],
  },
  {
    name: "NEURO-SYNAPSE",
    kind: "AI experiment",
    blurb: "An experiment in neural-network concepts. Details to be added.",
    tags: ["AI/ML"],
  },
  {
    name: "Weather Dashboard",
    kind: "Data / Web",
    blurb: "A dashboard that presents weather data from an API.",
    tags: ["JavaScript", "REST APIs"],
  },
  {
    name: "Sorting Algorithm Visualizer",
    kind: "Algorithms",
    blurb: "A visual tool for watching how sorting algorithms work step by step.",
    tags: ["Algorithms", "Visualization"],
  },
  {
    name: "Grid-Based Adventure Game",
    kind: "Game logic",
    blurb: "A small adventure game played on a grid, built to practise game logic.",
    tags: ["Game logic"],
  },
  {
    name: "Biometric Voting System",
    kind: "Systems / Security",
    blurb: "A voting system concept built around biometric identification.",
    tags: ["Biometrics", "Systems"],
  },
];

/**
 * Build log. Dates have not been supplied, so none are shown. Add a `date`
 * (e.g. "2026-03") to any entry and it will appear automatically.
 * Bodies only restate facts already stated in the project case studies.
 */
export const buildLog: LogEntry[] = [
  {
    slug: "deploying-a-water-quality-monitoring-prototype",
    title: "Deploying a Water-Quality Monitoring Prototype",
    category: "IoT / Samudra",
    summary: "Taking Samudra from a bench setup to collecting water-quality data in Mahim Bay.",
    body: [
      "Samudra started as sensors wired to an ESP32. The step that changed it from a bench project into something real was putting it in the water at Mahim Bay and collecting data.",
      "Once outside, the problems that a desk hides become obvious: sensor reliability, moisture and salt, connectivity and power.",
    ],
  },
  {
    slug: "building-a-geospatial-intelligence-dashboard",
    title: "Building a Geospatial Intelligence Dashboard",
    category: "Geospatial / GeoMonitor",
    summary: "Designing a map interface that combines several real-time layers without becoming cluttered.",
    body: [
      "The core design decision in GeoMonitor was treating every data source as an independent layer on a shared map.",
      "That makes it possible to add sources without redesigning the interface, and to keep the screen readable by showing only what is switched on.",
    ],
  },
  {
    slug: "lessons-from-working-with-real-world-sensor-data",
    title: "Lessons From Working With Real-World Sensor Data",
    category: "IoT / Data",
    summary: "Why readings from real sensors need filtering, calibration and sanity checks before anyone trusts them.",
    body: [
      "Sensor values do not arrive clean. They drift, spike and occasionally fail, so a pipeline that simply forwards raw readings produces a dashboard that is hard to believe.",
      "Calibration against known references and smoothing before display are what make the trend readable.",
    ],
  },
  {
    slug: "implementing-shortest-path-routing",
    title: "Implementing Shortest-Path Routing",
    category: "Algorithms / SafeCity",
    summary: "Using Dijkstra's algorithm on a road graph, and what changes when cost is not only distance.",
    body: [
      "Dijkstra's algorithm finds the lowest-cost path across a graph. In a standard route finder cost is distance or time.",
      "In SafeCity the interesting step is letting risk contribute to the cost, so the algorithm itself is unchanged and the meaning of 'best' is what changes.",
    ],
  },
  {
    slug: "designing-an-ml-based-risk-classification-pipeline",
    title: "Designing an ML-Based Risk Classification Pipeline",
    category: "AI/ML / SafeCity",
    summary: "Structuring risk classification so that the model, the spatial data and the map stay separate.",
    body: [
      "Keeping classification as its own stage means the model can be improved and re-evaluated without touching the database or the dashboard.",
      "PostGIS holds the spatial side, the model assigns the classes, and the map only has to display the result.",
    ],
  },
];

export const stack = [
  { group: "Languages", items: ["Python", "C", "C++", "Java", "JavaScript", "SQL"] },
  { group: "AI / Data", items: ["Machine Learning", "Data Analytics", "Pandas", "NumPy", "Scikit-learn"] },
  { group: "Development", items: ["React", "Flask", "FastAPI", "Node.js", "REST APIs"] },
  { group: "Databases", items: ["MySQL", "PostgreSQL", "PostGIS"] },
  { group: "Tools", items: ["Git", "GitHub", "VS Code"] },
  { group: "Hardware / Systems", items: ["ESP32", "IoT", "Sensors", "LoRa"] },
];

export const about = {
  paragraphs: [
    "I'm a Computer Engineering student interested in the intersection of AI, data and software engineering.",
    "I enjoy taking ambiguous real-world problems and breaking them down into systems that can actually be built, tested and improved.",
    "My interests currently span AI/ML, data analytics, full-stack development, geospatial systems, IoT and automation.",
  ],
  facts: [
    { k: "Based in", v: "Mumbai, India" },
    { k: "Studying", v: "Computer Engineering" },
    { k: "Currently interested in", v: "AI/ML · Data analytics · Full-stack · Geospatial · IoT · Automation" },
    { k: "Technical focus", v: "Turning real-world problems into working systems" },
  ],
};

/** Verified entries only. Anything marked placeholder renders as such. */
export const experience: {
  role: string;
  org: string;
  dates: string;
  description: string;
  contributions: string[];
  placeholder?: boolean;
}[] = [
  {
    role: "Role title",
    org: "Organisation",
    dates: "Start — End",
    description: "Add a verified internship, role or sustained project here.",
    contributions: ["Add what you personally built or delivered", "Add a second concrete contribution"],
    placeholder: true,
  },
];

export const achievements: { type: string; title: string; note?: string; placeholder?: boolean }[] = [
  {
    type: "Technical",
    title: "Deployed the Samudra prototype to collect water-quality data in Mahim Bay",
  },
  {
    type: "Hackathon",
    title: "Built MARLIN, a maritime intelligence dashboard, for Smart India Hackathon",
    note: "Participation only. Add the result once confirmed.",
  },
  {
    type: "Add",
    title: "Verified hackathons, competitions, awards and certifications",
    placeholder: true,
  },
];
