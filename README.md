# Mathdyl portfolio

A responsive developer portfolio built with Next.js App Router, TypeScript, React, Tailwind CSS, and Lucide React. Server components handle content; client components handle navigation, filtering, reveals, and animation preferences. Canvas frames do not update React state.

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
npm test
npm run build
npm start
```

Use `npm ci` when installing from the committed lockfile.

With the production server running, use `node scripts/check-routes.mjs` to check pages, internal links, anchors, assets, metadata, 404 responses, robots, and the sitemap. Pass a different origin as the first argument if needed. On PowerShell systems that block `npm.ps1`, use `npm.cmd` for the same commands.

## Make it yours

- Personal information and navigation: `src/config/site.ts`. Email and GitHub are configured; LinkedIn is currently `null`. Update these values as needed. Contact links appear automatically. Unconfigured channels show a coming-soon state; there is no fake form or backend.
- Site origin: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your public domain before deployment. This controls canonical URLs, Open Graph URLs, robots, and the sitemap.
- Projects: `src/data/projects.ts`. Add an entry to generate its card and `/projects/[slug]` route automatically. The initial four entries are sample case studies with suggested technology stacks; replace them with verified project information and set `sample: false`.
- Categories: `src/lib/constants.ts`. Add a category once; TypeScript and the filter controls pick it up automatically.
- Screenshots: `public/images/projects/`. Reference them with paths such as `/images/projects/my-project.png`. Each image has an alt text field. The SVG files are original illustrative concept previews, not actual application screenshots. Their companion workflow diagrams are also illustrative.
- Skills and capabilities: `src/data/skills.ts` and `src/data/services.ts`.
- Design: `src/app/globals.css`. CSS variables keep the palette centralized. Tailwind v4 uses `@import "tailwindcss"` and the PostCSS plugin; no legacy Tailwind configuration is needed.
- Optional asset locations: `public/images/logos/`, `public/icons/`, and `public/resume/`.

## Project model

`src/types/project.ts` defines typed categories, cover and gallery images, descriptions, technologies, and optional case-study sections. Authoring entries require a unique lowercase kebab-case `slug` and a `title`; the exported catalog normalizes optional content once for cards, filtering, routes and metadata. Invalid entries and duplicate slugs are excluded without breaking other projects. Missing descriptions receive a fallback, missing lists become empty, and missing/broken previews use a local placeholder. Keep image sources as local `public/` paths. Empty optional sections and invalid repository/demo links are hidden. Include `githubUrl` and/or `liveUrl` only when a real absolute HTTP(S) destination exists.

The existing View project link covers the full card while image, title, source and demo anchors remain independent. `npm run typecheck` regenerates Next.js route types before checking TypeScript, including after a stale development cache. See [the project navigation report](docs/PROJECT_NAVIGATION_FIX.md) for diagnosis, changed files, validation and remaining browser checks.

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

Lint, TypeScript, the production build, and 38 automated regression tests pass. Tests cover particles/network bounds, pause/resume, reduced motion, hidden tabs, pointer easing, resizing, scroll parallax, one-time reveals, mobile menus, navigation, sphere geometry/lifecycle/fallbacks, shared fade-up heading timing/accessibility, navbar scroll batching and restoration, observer failure recovery, keyboard reveal access, slow hydration, destination scroll resets, hash links, accessible navigation icons, and tooltip handoff. These tests use simulated browser events and server rendering; they do not replace rendered browser testing.

Production HTTP checks cover all eight public content routes, eight internal destinations, 17 anchors, 26 assets, metadata, robots, sitemap, 404s, shared heading reveals, single background instances, and absence of equation overlays. No browser was connected, so console inspection, actual viewport overflow measurements, visual checks, and interactive browser QA remain outstanding. See `docs/UI_REFINEMENT.md` for the current implementation report; earlier reports in `docs/` record prior stages.

Dependencies are unchanged by this update. No animation or testing dependencies were added.

Open Graph previews use PNG assets (the source SVG previews are retained). The default branded social image lives in `public/images/social/`.

## Visual identity

The interface preserves its black foundation (#050505), white and silver typography, monochrome controls, fine borders, and restrained ambient lighting. Faint cool ambient light complements the existing palette. The existing Arial font is retained; small labels and metadata use the system monospace stack. Floating navigation, an identity-led hero with an unboxed geometric sphere, and consistent dark cards express the Antigravity-inspired direction without copying Google's branding or assets.

Shared components: `PageHeading`, `SectionTitle`, and Home use `RevealText` for accessible whole-heading fade-up entrances. `Reveal` provides one viewport-triggered entrance per content block: 750 ms, `cubic-bezier(.22, 1, .36, 1)`, 30 px travel, and 100 ms stagger increments on desktop and mobile. `lib/motion.ts` supplies the shared values as CSS variables. Intersection Observer uses a 0.1 threshold and an 8% bottom inset. `PageTransition` handles exits only and keys the content by pathname, so destination reveals replay on navigation without restarting the background or replaying on component updates. Cards, skills, services, contact channels, screenshots, case-study sections, footer content, and the 404 page use the shared system.

The navbar compacts after 100 px of scrolling and expands again at 80 px, avoiding jitter around the boundary. Its surface transitions over 380 ms inside a stable sticky slot, preserving page spacing. Desktop hover, keyboard focus, and an open mobile menu restore its normal height; touch targets remain at least 44 px. A passive scroll listener batches updates into one animation frame without React rerenders. The pre-paint reveal bootstrap avoids initial flashing, releases content after two seconds if hydration stalls, and skips reduced motion. Reveals also recover from observer setup failures or missing initial callbacks, show focused controls immediately, and release animation fill state after completion. See `docs/ANIMATION_NAVIGATION.md` for implementation and validation details.

The minimized navigation now narrows to a centered 300 px surface (clamped to the viewport) with the M glyph and Lucide Home, FolderCode, UserRound, and Mail icons. Labels, icons, spacing, and padding morph together. Every link retains its accessible name and active indicator. Dark tooltips identify icons during hover expansion, then yield to the full labels. Below 768 px, the expanded bar keeps the existing mobile menu; the compact bar provides direct icon links, and focused icons remain visible. Destination pathname commits reset scroll to zero synchronously before paint, independently of motion preferences; intercepted navigation also requests `scroll: true`. Hash links retain anchor scrolling, local component updates do not reset scroll, and same-page clicks return to the top while cancelling any pending exit. See `docs/NAVIGATION_REFINEMENT.md` for the current report.

`AntigravityBackground` remains in the root layout, with cursor/scroll inputs shared by the canvas and CSS atmosphere layers. Slow independent grid and radial-light drift provide idle depth. The profile, circular frame, portal effects, surrounding card, configuration, and setup asset have been removed; the hero keeps its content and geometric sphere with responsive spacing and no empty profile slot. `MathematicalSphere` retains projected 3D coordinates, shading, orbital nodes, and eased pointer response with reusable projection buffers. Static SVG geometry is available without Canvas or observation APIs. Decorative equations and text symbols have been removed; project and educational content are preserved.

The background uses 20–68 recycled particles in three depth layers, gentle upward drift, a subtle desktop pointer response, and bounded scroll parallax. Small screens and devices reporting four or fewer hardware threads are capped at 36 particles. Repulsion eases in and out, a faint desktop glow follows the cursor, and resizing preserves existing particle positions. Device pixel ratio is capped at 2 with an eight-million-pixel canvas budget for large screens. A single animation loop stops in hidden tabs and respects live reduced-motion preferences. The footer pause control freezes the existing scene and disables CSS animations; reduced motion uses a static scene. Forced colors hide decorative layers.

Project content, skill data, screenshots, and existing destinations are preserved. Cards use flexible content columns, inset previews, matching image ratios, optional configured source/demo links, and keyboard feedback. Capabilities, skills, principles, and contact channels share dark bordered surfaces. Responsive spacing, simplified mobile geometry, scrollable floating menus, visible focus states, and larger interaction targets refine the existing design.

Mathdyl Solution appears alongside the personal introduction, Home contact CTA, Contact page, and footer with the tagline “Engineering Intelligent Solutions.” Service and project claims remain unchanged.

The sphere caps pixel ratio at 2 (1.5 on small/lower-powered devices), reduces geometry and drawing frequency on mobile, and stops when offscreen, hidden, paused, or reduced motion is enabled. Ambient CSS layers also stop in hidden tabs. Navigation uses a short Web Animations exit, followed by the destination's own reveals; browser history remains managed by Next. No page snapshots freeze the environment. Reduced motion and the pause control show content immediately, and completed reveals are not hidden again on resume.
