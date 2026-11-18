import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import { ProjectCard } from "../ProjectCard";
import { projects } from "@/data/projects";
import { experiments } from "@/data/content";

export function Work() {
  const [samudra, geo, safe, trip] = projects;
  return (
    <section id="work" aria-labelledby="work-title" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          index="02"
          label="Projects"
          id="work-title"
          title="SELECTED WORK"
          sub="Systems, prototypes and experiments I've built while exploring technology and real-world problems."
        />

        <div className="space-y-24 md:space-y-32">
          <Reveal><ProjectCard project={samudra} variant="feature" /></Reveal>

          <div className="grid gap-16 md:grid-cols-2 md:gap-10 lg:gap-14">
            <Reveal><ProjectCard project={geo} variant="tall" /></Reveal>
            <Reveal delay={0.1}><ProjectCard project={safe} variant="tall" /></Reveal>
          </div>

          <Reveal><ProjectCard project={trip} variant="row" /></Reveal>
        </div>

        <div className="mt-28">
          <Reveal>
            <h3 className="label mb-8 flex items-center gap-3">
              <span className="text-accent">+</span> More experiments
            </h3>
          </Reveal>
          <ul className="border-t border-line">
            {experiments.map((e, i) => (
              <li key={e.name} className="border-b border-line">
                <Reveal delay={i * 0.04}>
                  <div className="grid gap-2 py-5 md:grid-cols-12 md:items-baseline md:gap-6">
                    <p className="font-mono text-xs text-muted md:col-span-1">{String(i + 1).padStart(2, "0")}</p>
                    <h4 className="text-xl font-medium tracking-tight md:col-span-3">{e.name}</h4>
                    <p className="text-sm text-muted md:col-span-5">{e.blurb}</p>
                    <p className="font-mono text-[0.68rem] uppercase tracking-wider text-muted md:col-span-3 md:text-right">
                      {e.tags.join(" · ")}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
