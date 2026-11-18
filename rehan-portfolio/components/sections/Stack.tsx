import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import { stack } from "@/data/content";

export function Stack() {
  return (
    <section id="stack" aria-labelledby="stack-title" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          index="04"
          label="How I build"
          id="stack-title"
          title="TECHNICAL STACK"
          sub="Grouped by what each tool is used for, not by logo."
        />
        <dl className="border-t border-line">
          {stack.map((g, i) => (
            <Reveal key={g.group} delay={i * 0.04}>
              <div className="grid gap-3 border-b border-line py-6 md:grid-cols-12 md:gap-6">
                <dt className="font-mono text-xs uppercase tracking-[0.14em] text-accent md:col-span-3">{g.group}</dt>
                <dd className="md:col-span-9">
                  <ul className="flex flex-wrap gap-x-6 gap-y-2 text-lg md:text-xl">
                    {g.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
