import { Reveal } from "../Reveal";
import { ButtonLink } from "../ButtonLink";
import { emailHref, site } from "@/data/site";

export function ResumeCta() {
  return (
    <section id="resume" aria-labelledby="resume-title" className="border-t border-line py-24 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-end md:justify-between">
        <Reveal className="max-w-2xl">
          <p className="label mb-4">06 — Resume</p>
          <h2 id="resume-title" className="text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
            WANT THE SHORT VERSION?
          </h2>
          <p className="mt-5 text-lg text-muted">
            Download my resume for a concise overview of my experience, skills and projects.
          </p>
          {site.resumeIsPlaceholder && (
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-accent/80">
              Placeholder file — replace /public/Rehan-Mhate-Resume.pdf
            </p>
          )}
        </Reveal>
        <Reveal delay={0.1}>
          <ButtonLink href={site.links.resume} variant="primary" download>
            Download Resume
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="grid-bg border-t border-line py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="label mb-6">07 — Contact</p>
          <h2 id="contact-title" className="text-[clamp(2.6rem,9vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
            LET&apos;S BUILD
            <br />
            SOMETHING<span className="text-accent">.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10 max-w-xl">
          <p className="text-lg leading-relaxed text-muted">
            Interested in collaborating, discussing a project, or working on an interesting technical problem?
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={site.links.linkedin} variant="primary">LinkedIn</ButtonLink>
            <ButtonLink href={site.links.github}>GitHub</ButtonLink>
            <ButtonLink href={emailHref() ?? undefined}>Email</ButtonLink>
          </div>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Open to internships, collaborations and interesting technical projects.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
