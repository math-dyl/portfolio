# Mathdyl portfolio

A responsive developer portfolio built with Next.js App Router, TypeScript, React, Tailwind CSS, and Lucide React. Server components handle content; only navigation and category filtering need client state.

## Run locally

Node.js 20.9 or newer is required.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Checks and production

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

Use `npm ci` when installing from the committed lockfile.

## Make it yours

- Personal information and navigation: `src/config/site.ts`. Replace `email`, `github`, and `linkedin` (currently `null`) with real values. Contact links appear automatically. Unconfigured channels show a coming-soon state; there is no fake form or backend.
- Site origin: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your public domain before deployment. This controls canonical URLs, Open Graph URLs, robots, and the sitemap.
- Projects: `src/data/projects.ts`. Add an entry to generate its card and `/projects/[slug]` route automatically. The initial four entries are sample case studies with suggested technology stacks; replace them with verified project information and set `sample: false`.
- Categories: `src/lib/constants.ts`. Add a category once; TypeScript and the filter controls pick it up automatically.
- Screenshots: `public/images/projects/`. Reference them with paths such as `/images/projects/my-project.png`. Each image has an alt text field. The SVG files are original illustrative concept previews, not actual application screenshots. Their companion workflow diagrams are also illustrative.
- Skills and capabilities: `src/data/skills.ts` and `src/data/services.ts`.
- Design: `src/app/globals.css`. CSS variables keep the palette centralized. Tailwind v4 uses `@import "tailwindcss"` and the PostCSS plugin; no legacy Tailwind configuration is needed.
- Optional asset locations: `public/images/profile/`, `public/images/logos/`, `public/icons/`, and `public/resume/`.

## Project model

`src/types/project.ts` defines typed categories, cover and gallery images, descriptions, technologies, and optional case-study sections. Empty optional sections and unavailable repository/demo links are hidden. Include `githubUrl` and/or `liveUrl` only when a real destination exists.

## Structure

- `src/app/`: route pages, global layout, metadata, sitemap, robots, and 404
- `src/components/layout/`: navigation, footer, container
- `src/components/ui/`: buttons, badges, section headings
- `src/components/home/`: homepage sections
- `src/components/projects/`: cards, filters, grid, hero, gallery
- `src/components/contact/`: replaceable contact channels
- `src/data/`: content
- `src/config/`: site identity
- `src/lib/`: utilities and category definitions
- `src/types/`: project model

The contact section can later be replaced or extended with a real form service. Project data can be moved behind a CMS adapter while preserving the component contracts. No database, analytics, or unnecessary API routes are included.

## Validation notes

Lint, TypeScript, and the production build pass. HTTP checks cover all eight public content routes, invalid URLs returning 404, metadata, robots, sitemap, and internal links/assets. No browser was connected in the implementation environment, so interactive and visual browser QA remains outstanding. Responsive rules and keyboard controls were reviewed in code.

ESLint is pinned to 9.39.5 because the React and accessibility plugins bundled with this Next.js configuration do not support ESLint 10 yet. npm reports a deprecation notice for ESLint 9 during installation; the lint command itself passes without warnings. The dependency audit reports no vulnerabilities.

Open Graph previews use PNG assets (the source SVG previews are retained). The default branded social image lives in `public/images/social/`.

## Visual identity

The interface uses a near-black foundation, silver typography, fine borders, static technical grids, and restrained ambient lighting. The existing Arial font is retained; small labels and metadata use the system monospace stack.

Shared visual components: `src/components/layout/Brand.tsx` for the navbar/footer wordmark and `src/components/ui/TechBackdrop.tsx` for the hero/CTA decoration. The wireframe hero is static HTML/CSS and hidden from assistive technology. No animation, graphics, or font dependencies were added.

The visual update covers navigation, home sections, project cards/filter controls, case studies, About, Contact, footer, favicon, and the default social image. Project data and screenshots are unchanged. The CSS simplifies decorative elements at tablet/mobile widths and includes visible keyboard focus, reduced-motion support, and forced-colors fallbacks.

Responsive source review covered 320px, 375px, 768px, 1024px, and 1440px layouts. Actual viewport rendering, overflow measurements, and interactive browser tests could not be performed because no browser was connected. HTTP checks passed for all routes and branded assets after the redesign.
