# Rehan Mhate — Portfolio

Personal engineering portfolio built with Next.js (App Router), React, TypeScript, Tailwind CSS v4, Framer Motion and Lucide icons.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # type-check
```

## Structure

```
app/                  routes: home, /projects/[slug], 404, favicon, OG image
components/           Nav, Footer, Hero, ProjectCard, sections/, visuals/
data/                 all content lives here (see below)
public/               static files (resume PDF, future project images)
scripts/              make-placeholder-resume.mjs
```

## Editing content

Everything is data-driven. Nothing needs to change in components to update the site.

| File | Controls |
| --- | --- |
| `data/site.ts` | Name, SEO text, nav, **LinkedIn / GitHub / email / resume links** |
| `data/projects.ts` | The four case studies and their ten-section pages |
| `data/content.ts` | Intro, experiments, build log, tech stack, about, experience, achievements |

To add a project, append an object to `projects` in `data/projects.ts`. The card, the detail page, the static route and the previous/next navigation are generated from it.

## Content integrity: what is still a placeholder

The site only states facts that were supplied. These items are deliberately marked, so nothing is invented:

- **GitHub / email**: set in `data/site.ts`. The GitHub username `rehan-08` was read from the MARLIN repo's git remote; confirm it is the right profile.
- **Resume**: `public/Rehan-Mhate-Resume.pdf` is a placeholder PDF. Replace the file, then set `resumeIsPlaceholder` to `false` in `data/site.ts` to hide the notice.
- **Experience**: one clearly marked placeholder entry. Replace with verified roles.
- **Achievements**: Samudra deployment and the MARLIN / Smart India Hackathon build are listed; add confirmed results, awards and certifications.
- **Build log dates**: not supplied. Add `date: "2026-03"` to an entry and it shows automatically.
- **Results sections**: GeoMonitor, SafeCity and TripCap have no metrics claimed. Samudra states only the verified Mahim Bay deployment.
- **Project imagery**: the cards use code-drawn schematics. Put real photos or screenshots in `public/projects/<slug>/` and set `src` on the matching `demo` slot.
- **Per-project GitHub / demo links**: add under `links` in `data/projects.ts`; they appear on the card and page.

## Accessibility and performance

Semantic landmarks and heading order, skip link, visible focus states, keyboard-operable menu (Escape closes it), `aria-current` on the active nav item, and `prefers-reduced-motion` respected through `MotionConfig` plus CSS. Pages are statically generated; visuals are inline SVG, so no image payload.

Set `NEXT_PUBLIC_SITE_URL` to the deployed domain before publishing so Open Graph URLs resolve correctly.
