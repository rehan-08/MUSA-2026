import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import { intro } from "@/data/content";

export function Intro() {
  return (
    <section aria-labelledby="intro-title" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading index="01" label="Who I am" id="intro-title" title={<span className="uppercase">{intro.heading}</span>} />
          </div>
          <div className="space-y-6 lg:col-span-7">
            {intro.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className={i === 0 ? "text-2xl leading-snug md:text-3xl" : "text-lg leading-relaxed text-muted md:text-xl"}>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <ul className="mt-20 grid border-y border-line sm:grid-cols-2 lg:grid-cols-4">
          {intro.pillars.map((p, i) => (
            <li key={p.index} className="border-b border-line p-6 last:border-b-0 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
              <Reveal delay={i * 0.06}>
                <p className="font-mono text-xs text-accent">{p.index}</p>
                <h3 className="mt-6 text-xl font-medium tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
