import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/types";
import { ProjectVisual } from "./ProjectVisual";

type Variant = "feature" | "tall" | "row";

function Tags({ tags, max }: { tags: string[]; max?: number }) {
  const shown = max ? tags.slice(0, max) : tags;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Technologies">
      {shown.map((t) => (
        <li key={t} className="rounded-full border border-line px-3 py-1 font-mono text-[0.68rem] tracking-wide text-muted">
          {t}
        </li>
      ))}
      {max && tags.length > max && (
        <li className="px-1 py-1 font-mono text-[0.68rem] text-muted">+{tags.length - max}</li>
      )}
    </ul>
  );
}

function ExtLinks({ project }: { project: Project }) {
  const items = [
    ["GitHub", project.links.github],
    ["Demo", project.links.demo],
    ["Live", project.links.live],
  ].filter((x): x is [string, string] => Boolean(x[1]));
  if (!items.length) return null;
  return (
    <div className="relative z-10 mt-4 flex gap-5 text-sm">
      {items.map(([label, href]) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted transition-colors hover:text-accent">
          {label} <ArrowUpRight size={14} aria-hidden />
        </a>
      ))}
    </div>
  );
}

function Visual({ project, className = "" }: { project: Project; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-line bg-surface ${className}`}>
      <div className="aspect-[16/10] w-full origin-center transition-transform duration-700 ease-out group-hover:scale-[1.045] group-hover:-translate-y-1">
        <ProjectVisual visual={project.visual} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-transparent transition-colors duration-500 group-hover:ring-accent/40" />
    </div>
  );
}

function Title({ project, size }: { project: Project; size: string }) {
  return (
    <h3 className={`${size} font-semibold leading-none tracking-tight`}>
      <Link
        href={`/projects/${project.slug}`}
        className="after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
      >
        {project.name}
      </Link>
    </h3>
  );
}

function Meta({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm text-accent">{project.number}</span>
      <span aria-hidden className="h-px w-6 bg-line" />
      <span className="label">{project.category}</span>
    </div>
  );
}

function ReadCta() {
  return (
    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors duration-300 group-hover:text-accent">
      View case study
      <ArrowUpRight size={16} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </span>
  );
}

export function ProjectCard({ project, variant }: { project: Project; variant: Variant }) {
  if (variant === "feature") {
    return (
      <article className="group relative grid gap-8 lg:grid-cols-12 lg:gap-12">
        <Visual project={project} className="lg:col-span-7" />
        <div className="flex flex-col justify-center lg:col-span-5">
          <Meta project={project} />
          <div className="relative mt-6">
            <Title project={project} size="text-5xl sm:text-6xl md:text-7xl" />
          </div>
          {project.badge && (
            <p className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-accent">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              {project.badge}
            </p>
          )}
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg">{project.summary}</p>
          <div className="mt-6"><Tags tags={project.tags} /></div>
          <ReadCta />
          <ExtLinks project={project} />
        </div>
      </article>
    );
  }

  if (variant === "tall") {
    return (
      <article className="group relative flex h-full flex-col">
        <Visual project={project} />
        <div className="mt-7 flex flex-1 flex-col">
          <Meta project={project} />
          <div className="relative mt-5"><Title project={project} size="text-4xl sm:text-5xl" /></div>
          <p className="mt-5 text-base leading-relaxed text-muted">{project.summary}</p>
          <div className="mt-5"><Tags tags={project.tags} max={5} /></div>
          <ReadCta />
          <ExtLinks project={project} />
        </div>
      </article>
    );
  }

  return (
    <article className="group relative grid items-center gap-6 rounded-lg border border-line p-5 transition-colors duration-500 hover:border-accent/50 md:grid-cols-12 md:gap-10 md:p-7">
      <Visual project={project} className="md:col-span-4" />
      <div className="md:col-span-8">
        <Meta project={project} />
        <div className="relative mt-4"><Title project={project} size="text-3xl sm:text-4xl" /></div>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{project.summary}</p>
        <div className="mt-4"><Tags tags={project.tags} /></div>
        <ReadCta />
        <ExtLinks project={project} />
      </div>
    </article>
  );
}
