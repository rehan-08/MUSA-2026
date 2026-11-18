"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionHeading } from "../SectionHeading";
import { Reveal } from "../Reveal";
import { buildLog } from "@/data/content";

function Entry({ entry, index }: { entry: (typeof buildLog)[number]; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li className="border-b border-line">
      <Reveal delay={index * 0.04}>
        <div className="grid gap-3 py-6 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-2">
            <p className="font-mono text-xs text-accent">LOG {String(buildLog.length - index).padStart(3, "0")}</p>
            <p className="label mt-1 !text-[0.65rem]">{entry.date ?? "Date pending"}</p>
          </div>
          <div className="md:col-span-7">
            <p className="label mb-2 !text-[0.65rem]">{entry.category}</p>
            <h3 className="text-xl font-medium tracking-tight md:text-2xl">{entry.title}</h3>
            <p className="mt-2 text-muted">{entry.summary}</p>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 border-l border-accent/40 pl-5 pt-4 leading-relaxed text-fg/85">
                    {entry.body.map((b, i) => (
                      <p key={i}>{b}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="md:col-span-3 md:text-right">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((o) => !o)}
              className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
            >
              {open ? "Close" : "Read more"}
              <Plus size={16} aria-hidden className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </Reveal>
    </li>
  );
}

export function BuildLog() {
  return (
    <section id="build-log" aria-labelledby="log-title" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          index="03"
          label="Engineering journal"
          id="log-title"
          title="BUILD LOG"
          sub="Notes from building, deploying and debugging: what worked, what broke, and what changed."
        />
        <ol className="border-t border-line">
          {buildLog.map((e, i) => (
            <Entry key={e.slug} entry={e} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
