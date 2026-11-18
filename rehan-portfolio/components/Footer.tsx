import Link from "next/link";
import { emailHref, site } from "@/data/site";

function FooterLink({ href, children }: { href?: string; children: string }) {
  if (!href) {
    return (
      <span className="cursor-not-allowed text-muted/60" title="Link not added yet">
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="transition-colors duration-300 hover:text-accent"
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Link href="/" className="font-mono text-sm tracking-[0.18em]">
            REHAN MHATE
          </Link>
          <p className="label mt-3">AI / Data / Software</p>
          <p className="mt-1 text-sm text-muted">{site.location}</p>
        </div>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <li><FooterLink href={site.links.linkedin}>LinkedIn</FooterLink></li>
          <li><FooterLink href={site.links.github}>GitHub</FooterLink></li>
          <li><FooterLink href={emailHref() ?? undefined}>Email</FooterLink></li>
        </ul>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-muted sm:px-8">© 2026 Rehan Mhate</p>
      </div>
    </footer>
  );
}
