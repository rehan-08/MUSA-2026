import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  index,
  label,
  title,
  sub,
  id,
}: {
  index?: string;
  label: string;
  title: ReactNode;
  sub?: ReactNode;
  id?: string;
}) {
  return (
    <Reveal className="mb-12 md:mb-16">
      <p className="label mb-5 flex items-center gap-3">
        {index && <span className="text-accent">{index}</span>}
        <span aria-hidden className="h-px w-8 bg-line" />
        <span>{label}</span>
      </p>
      <h2 id={id} className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {sub && <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">{sub}</p>}
    </Reveal>
  );
}
