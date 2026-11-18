import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-bg hover:bg-fg",
  ghost: "border border-line text-fg hover:border-accent hover:text-accent",
};

/**
 * Link-as-button. An empty href means the real URL has not been supplied yet,
 * so we render an inert, clearly labelled button instead of a dead link.
 */
export function ButtonLink({
  href,
  children,
  variant = "ghost",
  arrow = "up-right",
  className = "",
  download,
}: {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: "up-right" | "right" | "none";
  className?: string;
  download?: boolean;
}) {
  const cls = `${base} ${variants[variant]} ${className}`;
  const icon =
    arrow === "none" ? null : arrow === "right" ? (
      <ArrowRight aria-hidden size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
    ) : (
      <ArrowUpRight
        aria-hidden
        size={16}
        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    );

  if (!href) {
    return (
      <span
        role="link"
        aria-disabled="true"
        title="Link not added yet"
        className={`${base} cursor-not-allowed border border-dashed border-line text-muted ${className}`}
      >
        {children}
        <span className="label !text-[0.6rem]">Soon</span>
      </span>
    );
  }

  const external = /^(https?:|mailto:)/.test(href);
  if (external || download) {
    return (
      <a
        href={href}
        className={cls}
        download={download ? "" : undefined}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {icon}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
      {icon}
    </Link>
  );
}
