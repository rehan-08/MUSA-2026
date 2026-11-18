import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import { about, achievements, experience } from "@/data/content";

function PlaceholderTag() {
  return (
    <span className="rounded-full border border-dashed border-accent/50 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-accent">
      Placeholder
    </span>
  );
}

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="05" label="Background" id="about-title" title="ABOUT" />

        <div className="grid gap-14 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p className={i === 0 ? "text-2xl leading-snug md:text-3xl" : "text-lg leading-relaxed text-muted"}>{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="lg:col-span-5">
            <dl className="border-t border-line">
              {about.facts.map((f) => (
                <div key={f.k} className="grid grid-cols-[8rem_1fr] gap-4 border-b border-line py-4 text-sm sm:grid-cols-[10rem_1fr]">
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Experience */}
        <div className="mt-24 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <h3 className="label">Experience</h3>
          </Reveal>
          <ol className="relative space-y-10 border-l border-line pl-8 lg:col-span-9">
            {experience.map((x, i) => (
              <li key={i} className="relative">
                <span aria-hidden className="absolute -left-[2.45rem] top-2 h-2.5 w-2.5 rounded-full border border-accent bg-bg" />
                <Reveal>
                  <div className={x.placeholder ? "rounded-lg border border-dashed border-line p-5" : ""}>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-xl font-medium">{x.role}</h4>
                      {x.placeholder && <PlaceholderTag />}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {x.org} · {x.dates}
                    </p>
                    <p className="mt-3 text-muted">{x.description}</p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted marker:text-accent">
                      {x.contributions.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        {/* Achievements */}
        <div className="mt-20 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <h3 className="label">Achievements</h3>
          </Reveal>
          <ul className="border-t border-line lg:col-span-9">
            {achievements.map((a, i) => (
              <li key={i} className="border-b border-line">
                <Reveal delay={i * 0.05}>
                  <div className="grid gap-2 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent">{a.type}</p>
                    <div>
                      <p className="flex flex-wrap items-center gap-3">
                        <span className={a.placeholder ? "text-muted" : ""}>{a.title}</span>
                        {a.placeholder && <PlaceholderTag />}
                      </p>
                      {a.note && <p className="mt-1 text-sm text-muted">{a.note}</p>}
                    </div>
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
