import type { JSX } from "react";
import type { VisualKey } from "@/data/types";
import { SamudraVisual } from "./visuals/SamudraVisual";
import { GeoMonitorVisual } from "./visuals/GeoMonitorVisual";
import { SafeCityVisual } from "./visuals/SafeCityVisual";
import { TripCapVisual } from "./visuals/TripCapVisual";

const map: Record<VisualKey, () => JSX.Element> = {
  samudra: SamudraVisual,
  geomonitor: GeoMonitorVisual,
  safecity: SafeCityVisual,
  tripcap: TripCapVisual,
};

/** Code-drawn schematic. Replace with a real screenshot via the project's demo slots. */
export function ProjectVisual({ visual }: { visual: VisualKey }) {
  const V = map[visual];
  return <V />;
}
