"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { RevealLine } from "../Reveal";
import { ButtonLink } from "../ButtonLink";
import { HeroVisual } from "../HeroVisual";
import { site } from "@/data/site";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="grid-bg relative flex min-h-[100svh] items-center overflow-hidden pb-12 pt-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="label mb-6 flex flex-wrap items-center gap-x-3 gap-y-1"
          >
            <span className="text-accent">REHAN MHATE</span>
            <span aria-hidden className="h-px w-6 bg-line" />
            <span>Computer Engineering · AI/ML · Data · Full-Stack</span>
          </motion.p>

          <h1 id="hero-title" className="text-[clamp(3rem,15vw,7.2rem)] lg:text-[clamp(3rem,9.2vw,7.2rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
            <RevealLine delay={0.05}>BUILDING</RevealLine>
            <RevealLine delay={0.15}>INTELLIGENT</RevealLine>
            <RevealLine delay={0.25}>
              SYSTEMS<span className="text-accent">.</span>
            </RevealLine>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-muted md:text-lg"
          >
            Computer Engineering student building solutions across AI/ML, data analytics, full-stack development, geospatial systems and IoT.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <ButtonLink href="/#work" variant="primary" arrow="right">Explore Projects</ButtonLink>
            <ButtonLink href={site.links.resume} arrow="right">View Resume</ButtonLink>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 grid max-w-xl grid-cols-1 gap-x-8 gap-y-3 border-t border-line pt-6 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted sm:grid-cols-3"
          >
            <div><dt className="sr-only">Location</dt><dd>Mumbai, India</dd></div>
            <div><dt className="sr-only">Study</dt><dd>Computer Engineering</dd></div>
            <div><dt className="sr-only">Focus</dt><dd>AI / Data / Software</dd></div>
          </motion.dl>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1 }} className="mt-6">
            <Link href="/projects/samudra" className="group inline-flex items-center gap-3 text-sm text-muted transition-colors hover:text-fg">
              <span aria-hidden className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-accent" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span>
                <span className="text-fg">Samudra</span> — water-quality prototype deployed in Mahim Bay
              </span>
              <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
