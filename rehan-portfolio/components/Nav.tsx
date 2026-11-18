"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/data/site";

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [active, setActive] = useState<string>("top");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // scroll-spy for the home page
  useEffect(() => {
    if (!onHome) return;
    const ids = nav.map((n) => n.id).filter((id) => id !== "top");
    const targets = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (window.scrollY < 200) setActive("top");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [onHome]);

  useEffect(() => {
    if (!onHome) {
      const onScroll = () => setScrolled(window.scrollY > 24);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [onHome]);

  // lock scroll + Escape to close while mobile menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (id: string) => (onHome ? active === id : id === "work" && pathname.startsWith("/projects"));

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-bg/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-mono text-sm font-medium tracking-[0.18em]" onClick={() => setOpen(false)}>
          REHAN MHATE
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                aria-current={isActive(n.id) ? "page" : undefined}
                className={`relative text-sm transition-colors duration-300 hover:text-fg ${
                  isActive(n.id) ? "text-accent" : "text-muted"
                }`}
              >
                {n.label}
                {isActive(n.id) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-px bg-accent"
                    transition={{ duration: 0.35 }}
                  />
                )}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={site.links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-line px-4 py-1.5 text-sm transition-colors duration-300 hover:border-accent hover:text-accent"
            >
              Resume ↗
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </nav>
    </header>

      {/* sibling of the header: backdrop-filter on the header would otherwise become the containing block of this fixed overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-bg md:hidden"
          >
            <ul className="flex h-full flex-col justify-center gap-1 px-5 pb-16">
              {nav.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-baseline gap-4 border-b border-line py-4 text-4xl font-semibold tracking-tight ${
                      isActive(n.id) ? "text-accent" : "text-fg"
                    }`}
                  >
                    <span className="label !text-[0.65rem]">0{i + 1}</span>
                    {n.label}
                  </Link>
                </motion.li>
              ))}
              <li className="pt-8">
                <a
                  href={site.links.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-bg"
                >
                  Resume ↗
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
