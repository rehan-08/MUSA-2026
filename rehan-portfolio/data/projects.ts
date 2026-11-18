import type { Project } from "./types";

/**
 * Project case studies.
 *
 * Content rule: only claims supplied by Rehan are stated as fact. Where a
 * result, metric or deployment detail has not been supplied, `results.verified`
 * is false and the page shows a clearly marked placeholder rather than a claim.
 * Replace the `demo` slots' `src` with files placed in /public/projects/<slug>/.
 */
export const projects: Project[] = [
  {
    slug: "samudra",
    number: "01",
    name: "Samudra",
    category: "IoT / Environmental Monitoring / Data",
    summary:
      "A real-time water-quality monitoring system designed to collect environmental data through distributed sensors and transmit it for remote monitoring and analysis.",
    tags: ["ESP32", "pH Sensor", "TDS Sensor", "Turbidity Monitoring", "Temperature Sensor", "LoRa", "IoT Dashboard"],
    visual: "samudra",
    badge: "Prototype deployed — Mahim Bay",
    links: {},
    sections: {
      overview: [
        "Samudra is a water-quality monitoring prototype. Sensors measure the water, an ESP32 reads and packages the measurements, LoRa carries them over distance, and a dashboard makes them visible remotely.",
        "The prototype has been deployed to collect water-quality data in Mahim Bay, Mumbai. It is a working field prototype, not a production-scale network.",
      ],
      problem: [
        "Water quality changes continuously, but it is usually checked by taking a sample and testing it later. That gives isolated snapshots, and by the time a result arrives the water has already changed.",
        "Monitoring a coastal site continuously is difficult for practical reasons: the location may have no wired power or network, the sensors sit in a harsh environment, and the data has to reach someone who is not standing next to the device.",
      ],
      approach: [
        "Samudra measures the parameters that describe the water on a schedule, instead of waiting for manual sampling. Each node reads pH, TDS, turbidity and temperature, then sends the readings onward for remote viewing.",
        "LoRa was chosen as the link because the node needs to send small packets of data over a distance with low power draw, which suits periodic sensor readings better than a high-bandwidth link.",
      ],
      architecture: {
        intro: "One linear path from the water to a screen. Each stage has a single job, which keeps faults easy to locate.",
        steps: [
          { label: "Water Sensors", detail: "pH · TDS · turbidity · temperature" },
          { label: "ESP32", detail: "Reads, filters and packages readings" },
          { label: "LoRa", detail: "Low-power long-range transmission" },
          { label: "Cloud / Data Layer", detail: "Receives and stores readings" },
          { label: "Dashboard", detail: "Remote visualization" },
        ],
      },
      technology: [
        { group: "Microcontroller", items: ["ESP32"] },
        { group: "Sensing", items: ["pH sensor", "TDS sensor", "Turbidity sensor", "Temperature sensor"] },
        { group: "Communication", items: ["LoRa"] },
        { group: "Software", items: ["IoT dashboard", "Data storage layer"] },
      ],
      implementation: [
        {
          title: "Hardware",
          body: "An ESP32 is the controller of the node. It reads the attached sensors and hands the values to the radio. Each sensor answers a different question about the water.",
          items: [
            { name: "ESP32", note: "Microcontroller that samples sensors and manages transmission." },
            { name: "pH sensor", note: "Acidity or alkalinity of the water." },
            { name: "TDS sensor", note: "Total dissolved solids, a proxy for dissolved content." },
            { name: "Turbidity sensor", note: "How cloudy the water is." },
            { name: "Temperature sensor", note: "Water temperature, which also affects other readings." },
          ],
        },
        {
          title: "Data pipeline",
          body: "Data moves in one direction and is handled in clear stages.",
          steps: ["Sensor reading", "Processing", "Transmission", "Storage", "Visualization"],
        },
        {
          title: "Deployment",
          body: "The prototype was deployed in Mahim Bay to collect water-quality data. Deployment photographs belong in the demo section once added.",
        },
      ],
      challenges: [
        { title: "Sensor reliability", body: "Low-cost sensors drift and can fail in water. Readings need sanity checks before they are trusted." },
        { title: "Environmental conditions", body: "Salt water, moisture and weather are hard on electronics and enclosures." },
        { title: "Connectivity", body: "A radio link in a real location is less predictable than one on a desk, so the system has to tolerate gaps." },
        { title: "Power", body: "A node that cannot be plugged in has a limited energy budget, which constrains how often it can sample and transmit." },
        { title: "Calibration", body: "Analog water sensors need calibrating against known references to produce meaningful numbers." },
        { title: "Noisy measurements", body: "Real signals fluctuate. Smoothing and filtering are needed so the dashboard shows the trend, not the noise." },
      ],
      results: {
        statement: "The prototype was deployed in Mahim Bay and used to collect water-quality data.",
        verified: true,
        notes: [
          "No accuracy figures, uptime numbers or scale claims are made here. Add measured results once they are documented.",
        ],
      },
      demo: [
        { label: "ESP32 hardware", kind: "photo" },
        { label: "Sensor assembly", kind: "photo" },
        { label: "Mahim Bay deployment", kind: "photo" },
        { label: "Dashboard", kind: "screenshot" },
      ],
      future: [
        "Predictive water-quality analytics",
        "Automated alerts",
        "Additional environmental parameters",
        "Solar-powered operation",
        "Larger sensor networks",
        "Historical trend analysis",
      ],
    },
  },
  {
    slug: "geomonitor",
    number: "02",
    name: "GeoMonitor",
    category: "AI / Geospatial Intelligence / Real-Time Data",
    summary:
      "An AI-powered geospatial intelligence dashboard designed to combine multiple real-time data layers into an interactive operational interface.",
    tags: ["WebGL", "JavaScript", "Geospatial Data", "AI/ML", "Interactive Mapping", "Real-Time Data"],
    visual: "geomonitor",
    links: {},
    sections: {
      overview: [
        "GeoMonitor brings several live data layers into one interactive map interface, so an operator can look at one screen instead of switching between separate sources.",
        "The interface is built around the map. Layers can be toggled, compared and inspected, with AI components assisting in surfacing what matters.",
      ],
      problem: [
        "Situational information about a region is scattered across separate feeds, each with its own format and its own viewer. Putting them side by side is slow and relies on the person doing the combining.",
        "The challenge is both data integration and presentation: layers have to line up spatially and remain readable when many are active at once.",
      ],
      approach: [
        "Treat every data source as a layer on a shared map. Each layer is normalised to a common geographic frame so layers can be switched and overlaid independently.",
        "Use WebGL for rendering so that a dense map stays interactive, and add AI/ML components on top of the data to support analysis rather than only display.",
      ],
      architecture: {
        intro: "Data sources are normalised, layered on the map and then enriched by AI components before reaching the interface.",
        steps: [
          { label: "Data Sources", detail: "Real-time geospatial feeds" },
          { label: "Ingestion & Normalisation", detail: "Common format and coordinates" },
          { label: "Layer Engine", detail: "Independent, toggleable layers" },
          { label: "AI Components", detail: "Analysis on top of the layers" },
          { label: "Map Interface", detail: "WebGL interactive dashboard" },
        ],
      },
      technology: [
        { group: "Rendering", items: ["WebGL", "Interactive mapping"] },
        { group: "Language", items: ["JavaScript"] },
        { group: "Data", items: ["Geospatial data", "Real-time data"] },
        { group: "Intelligence", items: ["AI/ML"] },
      ],
      implementation: [
        {
          title: "Data layers",
          body: "Each layer is an independent module: it loads its own data, styles it for the map and can be switched on or off without affecting the others.",
        },
        {
          title: "Map interface",
          body: "A single WebGL map is the primary surface. Selecting a feature opens its details, and layer controls sit alongside the map instead of in separate screens.",
        },
        {
          title: "AI components",
          body: "AI/ML components work on the data layers to support interpretation. Specific models and their evaluation are to be documented here.",
        },
        {
          title: "India-centric design",
          body: "The default view and the data emphasis are oriented toward India, rather than treating the country as one region among many on a world map.",
        },
      ],
      challenges: [
        { title: "Heterogeneous data", body: "Different sources use different schemas, update rates and coordinate conventions that have to be reconciled." },
        { title: "Rendering performance", body: "Many active layers can overwhelm the browser, so rendering has to stay efficient." },
        { title: "Readability", body: "More layers means more clutter. The interface needs hierarchy so the important layer is not buried." },
        { title: "Real-time updates", body: "Live data must refresh without disrupting what the user is currently looking at." },
      ],
      results: {
        statement: "No measured results are claimed yet.",
        verified: false,
        notes: ["Add verified outcomes here: what it was used for, what it showed, and how it performed."],
      },
      demo: [
        { label: "Main map interface", kind: "screenshot" },
        { label: "Layer controls", kind: "screenshot" },
        { label: "Demo link", kind: "link" },
      ],
      future: [
        "More data layers and sources",
        "Stronger AI-driven analysis and alerting",
        "Saved views and shareable map states",
        "Historical playback of layer data",
      ],
    },
  },
  {
    slug: "safecity",
    number: "03",
    name: "SafeCity",
    category: "AI/ML / GIS / Urban Technology",
    summary:
      "An intelligent urban safety platform combining machine learning, geospatial analysis and interactive mapping to identify and analyze potential safety risks.",
    tags: ["Python", "Machine Learning", "PostgreSQL", "PostGIS", "React / Dashboard", "Leaflet / OpenStreetMap", "Dijkstra's Algorithm"],
    visual: "safecity",
    links: {},
    sections: {
      overview: [
        "SafeCity analyses an urban area for potential safety risks. A machine learning model scores locations, PostGIS handles the spatial side, and a map dashboard presents the result.",
        "It also uses Dijkstra's algorithm for routing, so risk can influence the path a person is shown instead of distance alone.",
      ],
      problem: [
        "Safety is rarely shown on a map. A standard route finder returns the shortest path, which says nothing about how the surrounding area compares with alternatives.",
        "The problem is turning scattered location data into something a person can act on: where the risk is concentrated, how severe it appears, and what a safer alternative looks like.",
      ],
      approach: [
        "Divide the problem into three parts: estimate risk with machine learning, store and query it spatially with PostGIS, and present it on an interactive map.",
        "Keep the engineering decisions visible. Risk classification is a separate step from routing, so each can be tested and changed on its own.",
      ],
      architecture: {
        intro: "Data flows from storage through the model into spatial queries, then out to the map and the router.",
        steps: [
          { label: "Spatial Data", detail: "PostgreSQL + PostGIS" },
          { label: "ML Risk Model", detail: "Python classification pipeline" },
          { label: "Risk Layer", detail: "Classified areas for the map" },
          { label: "Routing", detail: "Dijkstra's algorithm on a road graph" },
          { label: "Dashboard", detail: "React + Leaflet / OpenStreetMap" },
        ],
      },
      technology: [
        { group: "Machine learning", items: ["Python", "Machine learning"] },
        { group: "Spatial database", items: ["PostgreSQL", "PostGIS"] },
        { group: "Frontend", items: ["React dashboard", "Leaflet", "OpenStreetMap"] },
        { group: "Algorithms", items: ["Dijkstra's algorithm"] },
      ],
      implementation: [
        {
          title: "Risk classification",
          body: "A model assigns a risk class to each location, so the map can show a heatmap and discrete levels instead of a single undifferentiated number.",
        },
        {
          title: "Spatial storage",
          body: "PostGIS stores the geometry and answers spatial questions, such as what falls inside an area or near a route, directly in the database.",
        },
        {
          title: "Safer routing",
          body: "Dijkstra's algorithm finds the lowest-cost path over the road graph. Making the cost depend on risk as well as distance is what turns a shortest route into a safer one.",
        },
        {
          title: "Dashboard",
          body: "A Leaflet map on OpenStreetMap tiles shows the heatmap, the risk classes and routes, inside a React dashboard.",
        },
      ],
      challenges: [
        { title: "Data quality", body: "A model is only as good as the data it learns from, and location data is uneven and often incomplete." },
        { title: "Defining risk", body: "Deciding what counts as risk, and how to weigh it against distance in routing, is a design decision with real consequences." },
        { title: "Responsible presentation", body: "Labelling an area as risky affects how people view it, so classification must be communicated carefully." },
        { title: "Spatial performance", body: "Queries over a large road network need indexes and careful structure to stay fast." },
      ],
      results: {
        statement: "No model accuracy or performance figures are claimed yet.",
        verified: false,
        notes: ["Add evaluation results here once they are measured: metrics, dataset, and validation method."],
      },
      demo: [
        { label: "Risk heatmap", kind: "screenshot" },
        { label: "Route comparison", kind: "screenshot" },
        { label: "Dashboard", kind: "screenshot" },
      ],
      future: [
        "Model evaluation against a documented benchmark",
        "Time-aware risk, such as by hour of day",
        "User-reported data as an additional signal",
        "Explaining why a location is classified as risky",
      ],
    },
  },
  {
    slug: "tripcap",
    number: "04",
    name: "TripCap",
    category: "Full-Stack / Travel Technology",
    summary:
      "A travel planning platform designed to bring itineraries, activities, expenses, bookings and trip history into one organized workspace.",
    tags: ["Full-Stack", "Dashboard", "Itinerary Planning", "Expense Tracking", "Export"],
    visual: "tripcap",
    links: {},
    sections: {
      overview: [
        "TripCap puts the pieces of a trip in one workspace: the itinerary, activities, expenses, bookings and the history of past trips.",
        "It is a full-stack application: a dashboard on the front, and a data layer behind it that keeps every trip organised.",
      ],
      problem: [
        "Planning a trip normally spreads information across notes, messages, booking emails and spreadsheets. Nothing connects them, and it is hard to see the plan and its cost together.",
      ],
      approach: [
        "Make the trip the central object. Everything else, such as days, activities, bookings and expenses, belongs to a trip, so the whole plan is available in one place.",
        "Add the practical features people need on the move: activity suggestions while planning and export when the plan has to leave the app.",
      ],
      architecture: {
        intro: "A conventional full-stack layout, organised around the trip as the main entity.",
        steps: [
          { label: "Dashboard", detail: "Trip overview and navigation" },
          { label: "Planner", detail: "Itinerary, activities, bookings" },
          { label: "Expenses", detail: "Costs tracked per trip" },
          { label: "Data Layer", detail: "Trips and trip history" },
          { label: "Export", detail: "Take the plan out of the app" },
        ],
      },
      technology: [
        { group: "Application", items: ["Full-stack web application", "Dashboard UI"] },
        { group: "Stack details", items: ["To be added"] },
      ],
      implementation: [
        { title: "Itinerary and planning", body: "A day-by-day view organises activities and bookings, with suggestions to help fill gaps in the plan." },
        { title: "Expenses", body: "Costs are tracked alongside the plan so the budget is visible while planning, not only afterwards." },
        { title: "Trip history", body: "Past trips remain available as a reference for planning the next one." },
        { title: "Export", body: "A trip can be exported so the plan is usable outside the app." },
      ],
      challenges: [
        { title: "Modelling a trip", body: "A trip has many related parts. Structuring the data so that they stay consistent as the plan changes is the core design problem." },
        { title: "Many views of the same data", body: "Itinerary, expenses and history all read from the same trip, so they must never disagree." },
        { title: "Usability on the move", body: "Travel apps get used on phones in awkward conditions, so layout and clarity matter as much as features." },
      ],
      results: {
        statement: "No usage figures or outcomes are claimed.",
        verified: false,
        notes: ["Add what has been built and tested, and any real feedback, once available."],
      },
      demo: [
        { label: "Dashboard", kind: "screenshot" },
        { label: "Itinerary view", kind: "screenshot" },
        { label: "Expense tracker", kind: "screenshot" },
      ],
      future: [
        "Shared trips for travelling groups",
        "Offline access during travel",
        "Smarter activity suggestions",
        "Budget alerts",
      ],
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacent(slug: string): { prev: Project; next: Project } {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}
