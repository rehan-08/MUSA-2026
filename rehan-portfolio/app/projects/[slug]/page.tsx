import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, ImageIcon } from "lucide-react";
import { getAdjacent, getProject, projects } from "@/data/projects";
import { Reveal } from "@/components/Reveal";
import { ProjectVisual } from "@/components/ProjectVisual";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.name} — ${project.category.split(" / ")[0]}`,
    description: project.summary,
    openGraph: { title: `${project.name} — Rehan Mhate`, description: project.summary },
  };
}

const sectionList = [
  ["overview", "Overview"],
  ["problem", "The Problem"],
  ["approach", "Approach"],
  ["architecture", "Architecture"],
  ["technology", "Technology"],
  ["implementation", "Implementation"],
  ["challenges", "Challenges"],
  ["results", "Results"],
  ["demo", "Demo"],
  ["future", "Future"],
] as const;

function Block({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t border-line pt-10">
      <Reveal>
        <h2 id={`${id}-h`} className="label mb-8 flex items-center gap-3 !text-xs">
          <span className="text-accent">{String(n).padStart(2, "0")}</span>
          <span aria-hidden>—</span>
          <span className="text-fg">{title.toUpperCase()}</span>
        </h2>
      </Reveal>
      {children}
    </section>
  );
}

function Paras({ items }: { items: string[] }) {
  return (
    <div className="space-y-5">
      {items.map((p, i) => (
        <Reveal key={i} delay={i * 0.05}>
          <p className={i === 0 ? "text-xl leading-relaxed md:text-2xl md:leading-snug" : "text-lg leading-relaxed text-muted"}>{p}</p>
        </Reveal>
      ))}
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { prev, next } = getAdjacent(slug);
  const s = project.sections;
  const extLinks = [
    ["GitHub", project.links.github],
    ["Demo", project.links.demo],
    ["Live", project.links.live],
  ].filter((x): x is [string, string] => Boolean(x[1]));

  return (
    <article className="pt-28 md:pt-36">
      {/* header */}
      <header className="mx-auto max-w-7xl px-5 sm:px-8">
        <Link href="/#work" className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
          <ArrowLeft size={16} aria-hidden className="transition-transform group-hover:-translate-x-1" /> All projects
        </Link>
        <div className="mt-10 flex items-center gap-3">
          <span className="font-mono text-sm text-accent">{project.number}</span>
          <span aria-hidden className="h-px w-8 bg-line" />
          <span className="label">{project.category}</span>
        </div>
        <h1 className="mt-5 text-[clamp(3.4rem,13vw,10rem)] font-semibold leading-[0.88] tracking-[-0.045em]">{project.name}</h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{project.summary}</p>
        {project.badge && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-accent">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" /> {project.badge}
          </p>
        )}
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
          {project.tags.map((t) => (
            <li key={t} className="rounded-full border border-line px-3 py-1 font-mono text-[0.7rem] text-muted">{t}</li>
          ))}
        </ul>
        {extLinks.length > 0 && (
          <div className="mt-6 flex gap-5 text-sm">
            {extLinks.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-accent">
                {label} <ArrowUpRight size={14} aria-hidden />
              </a>
            ))}
          </div>
        )}
      </header>

      <div className="mx-auto mt-14 max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="aspect-[16/10] w-full md:aspect-[16/8]">
              <div className="h-full w-full">
                <ProjectVisual visual={project.visual} />
              </div>
            </div>
          </div>
          <p className="label mt-3 !text-[0.65rem]">Schematic illustration. Real screenshots and photographs belong in the Demo section.</p>
        </Reveal>
      </div>

      {/* body */}
      <div className="mx-auto mt-24 grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[14rem_1fr]">
        <aside aria-label="Case study sections" className="hidden lg:block">
          <ol className="sticky top-28 space-y-2 border-l border-line pl-4 text-sm">
            {sectionList.map(([id, label], i) => (
              <li key={id}>
                <a href={`#${id}`} className="flex gap-3 text-muted transition-colors hover:text-accent">
                  <span className="font-mono text-xs text-accent/70">{String(i + 1).padStart(2, "0")}</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <div className="min-w-0 space-y-24">
          <Block id="overview" n={1} title="Overview"><Paras items={s.overview} /></Block>
          <Block id="problem" n={2} title="The Problem"><Paras items={s.problem} /></Block>
          <Block id="approach" n={3} title="Approach"><Paras items={s.approach} /></Block>

          <Block id="architecture" n={4} title="Architecture">
            <Reveal><p className="mb-10 max-w-2xl text-lg text-muted">{s.architecture.intro}</p></Reveal>
            <ol className="flex flex-col gap-0 lg:flex-row lg:gap-0">
              {s.architecture.steps.map((step, i) => (
                <li key={step.label} className="relative flex-1">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="h-full border border-line bg-surface p-5 lg:border-r-0 lg:last:border-r">
                      <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
                      <p className="mt-4 text-lg font-medium leading-tight">{step.label}</p>
                      {step.detail && <p className="mt-2 text-sm text-muted">{step.detail}</p>}
                    </div>
                  </Reveal>
                  {i < s.architecture.steps.length - 1 && (
                    <span aria-hidden className="absolute -bottom-3 left-1/2 z-10 -translate-x-1/2 bg-bg px-1 text-accent lg:-right-2 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:px-0">
                      <span className="inline-block rotate-90 lg:rotate-0">→</span>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </Block>

          <Block id="technology" n={5} title="Technology">
            <dl className="border-t border-line">
              {s.technology.map((g) => (
                <Reveal key={g.group}>
                  <div className="grid gap-2 border-b border-line py-4 sm:grid-cols-[12rem_1fr]">
                    <dt className="font-mono text-xs uppercase tracking-[0.12em] text-accent">{g.group}</dt>
                    <dd className="text-lg">{g.items.join(" · ")}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </Block>

          <Block id="implementation" n={6} title="Implementation">
            <div className="space-y-14">
              {s.implementation.map((b) => (
                <Reveal key={b.title}>
                  <h3 className="text-2xl font-medium tracking-tight">{b.title}</h3>
                  <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">{b.body}</p>
                  {b.steps && (
                    <ol className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
                      {b.steps.map((st, i) => (
                        <li key={st} className="flex items-center gap-2">
                          <span className="rounded-full border border-line px-3 py-1.5">{st}</span>
                          {i < b.steps!.length - 1 && <span aria-hidden className="text-accent">→</span>}
                        </li>
                      ))}
                    </ol>
                  )}
                  {b.items && (
                    <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
                      {b.items.map((it) => (
                        <li key={it.name} className="bg-bg p-5">
                          <p className="font-medium">{it.name}</p>
                          <p className="mt-1 text-sm text-muted">{it.note}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              ))}
            </div>
          </Block>

          <Block id="challenges" n={7} title="Challenges">
            <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {s.challenges.map((c, i) => (
                <li key={c.title} className="bg-bg p-6">
                  <Reveal delay={(i % 2) * 0.06}>
                    <p className="font-medium">{c.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="results" n={8} title="Results">
            <Reveal>
              <div className={`rounded-lg p-6 ${s.results.verified ? "border border-accent/40" : "border border-dashed border-line"}`}>
                <p className={`mb-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] ${s.results.verified ? "text-accent" : "text-muted"}`}>
                  {s.results.verified ? "Verified" : "Placeholder — not yet documented"}
                </p>
                <p className="text-xl leading-snug">{s.results.statement}</p>
                {s.results.notes?.map((n) => (
                  <p key={n} className="mt-3 text-sm text-muted">{n}</p>
                ))}
              </div>
            </Reveal>
          </Block>

          <Block id="demo" n={9} title="Demo">
            <ul className="grid gap-4 sm:grid-cols-2">
              {s.demo.map((d, i) => (
                <li key={d.label}>
                  <Reveal delay={(i % 2) * 0.06}>
                    {d.src ? (
                      <figure>
                        <Image src={d.src} alt={d.label} width={1280} height={800} className="h-auto w-full rounded-lg border border-line" />
                        <figcaption className="label mt-2 !text-[0.65rem]">{d.label}</figcaption>
                      </figure>
                    ) : (
                      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line p-4 text-center">
                        <ImageIcon size={22} aria-hidden className="text-muted" />
                        <p className="text-sm">{d.label}</p>
                        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                          Placeholder · add {d.kind}
                        </p>
                      </div>
                    )}
                  </Reveal>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="future" n={10} title="Future">
            <ul className="border-t border-line">
              {s.future.map((f, i) => (
                <li key={f} className="border-b border-line">
                  <Reveal delay={i * 0.04}>
                    <p className="flex gap-4 py-4 text-lg">
                      <span className="font-mono text-xs leading-7 text-accent">{String(i + 1).padStart(2, "0")}</span>
                      {f}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Block>
        </div>
      </div>

      {/* prev / next */}
      <nav aria-label="Other projects" className="mt-32 border-t border-line">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-2">
          <Link href={`/projects/${prev.slug}`} className="group border-b border-line p-8 transition-colors hover:bg-surface sm:border-b-0 sm:border-r sm:p-12">
            <p className="label flex items-center gap-2"><ArrowLeft size={14} aria-hidden /> Previous project</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight transition-colors group-hover:text-accent">{prev.name}</p>
            <p className="mt-2 text-sm text-muted">{prev.category}</p>
          </Link>
          <Link href={`/projects/${next.slug}`} className="group p-8 text-left transition-colors hover:bg-surface sm:p-12 sm:text-right">
            <p className="label flex items-center gap-2 sm:justify-end">Next project <ArrowRight size={14} aria-hidden /></p>
            <p className="mt-4 text-4xl font-semibold tracking-tight transition-colors group-hover:text-accent">{next.name}</p>
            <p className="mt-2 text-sm text-muted">{next.category}</p>
          </Link>
        </div>
      </nav>
    </article>
  );
}
