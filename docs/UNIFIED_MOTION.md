# Unified motion and futuristic refinement

This report records a previous stage. The profile UI and masked word reveals
have since been replaced; see [UI_REFINEMENT.md](UI_REFINEMENT.md) for the current
implementation and validation.

Refined the existing portfolio without replacing its layout, brand, content,
project previews, navigation, or contact destinations. No dependencies added.

## Original Home animation

Inspection found a CSS animation in `RevealText` and `globals.css`: each word
starts at opacity 0 and `translateY(110%)`, rises to its final position over
650 ms with `cubic-bezier(.22, 1, .36, 1)`, and follows the previous word by 80 ms.
This original masked word treatment is retained. No animation library was present.

`lib/motion.ts` now owns timing, easing, offsets, and staggering, with CSS variables
provided by the root layout. `RevealText` uses the same word markup and animation
for every primary heading and section heading. `Reveal` triggers the same keyframe
for blocks, using 1.1 em of travel rather than 110% of an entire card's height.
Descriptions and CTAs share Home's 80 ms stagger increments across all page headers.

Each reveal owns one entrance. Header containers, sections, and page wrappers do
not animate over their already animated children. Previous blur, whole-page
entrances, alternate fade animations, and grouped parent/child motion were removed.

## Files and reusable components

- `lib/motion.ts`, `Reveal`, and `RevealText`: centralized Home motion, viewport
  triggers, and completed reveal state that survives pause/resume.
- New `PageHeading`: shared Projects, About, and Contact introductions.
- `SectionTitle`: shared scroll heading/description/action reveals.
- `PageTransition`: a 240 ms exit before ordinary internal link navigation; the
  destination owns its entrance. No snapshots pause background rendering. Route
  commits cancel exits and focus main content without scrolling. Modified clicks,
  downloads, anchors, external links, and Next's history behavior remain intact.
  Rapid clicks cancel the previous destination; failed navigation recovers visibility.
- Home `Hero`, `FeaturedProjects`, `Services`, and `ContactCTA`: shared entrances
  and independently observed content. Sphere and portrait entrances are coordinated
  with Home without stacking another animation on the entire instrument panel.
- About and Contact: independently observed paragraphs, principles, skills, and
  contact content. No new experience, education, or business claims were invented.
- `ProjectCard`, `ProjectFilter`, `ProjectHero`, `ProjectGallery`, new `CaseSection`,
  and the project detail route: independent cards, filters, tags, screenshots,
  descriptions, features, specifications, and case-study section entrances.
- `ProfilePortrait`: neutral silhouette, layered circular frame, faint animated
  lighting, orbital rings, gentle float, and restrained hover perspective. The
  same frame holds the actual photo once `public/images/profile.webp` exists.
  Detection happens on server render/build; `site.profileImage` can override it.
- `MathematicalSphere` and `lib/sphere.ts`: preserve existing idle rotation, depth,
  shading, and eased pointer interaction. Reuse projection buffers each frame;
  static SVG remains when Canvas or observation APIs are unavailable.
- `TechBackdrop`, sphere markup, and `globals.css`: remove decorative formulas,
  mathematical text markers, and plus-symbol overlays. Keep geometric grids,
  networks, and wireframes; actual project/educational content remains unchanged.
- `AntigravityBackground` and `MotionPreference`: CSS atmosphere layers now share
  eased cursor and scroll inputs with the existing particle network. The single
  background remains outside route content. Hidden tabs suspend CSS ambient and
  portrait animation as well as both canvas loops.
- `globals.css`: remove unused sphere CSS and competing entrance keyframes;
  standardize interaction duration at 220 ms and reuse the shared easing curve.

## Accessibility and performance

Server-rendered content remains readable without JavaScript. Reveals only start
on intersection, disconnect after the first trigger, and remain visible afterward.
Reduced motion, forced colors, and pause show static content immediately; resuming
does not re-hide it. Existing particle and pixel-density caps, mobile sphere drawing
limits, offscreen sphere suspension, tab suspension, and cleanup remain in place.
No background or sphere frames update React state. Portrait dimensions are reserved
and photos are cropped without stretching.

## Executed checks

- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed, including production TypeScript/static generation.
- `npm.cmd test`: all 23 tests passed. New coverage includes original heading word
  timing/accessibility, one-time reveals through pause/resume, route exit completion
  and cleanup, automatic portrait replacement, and unsupported sphere API fallback.
- `node scripts/check-routes.mjs http://127.0.0.1:3011`: passed for eight pages,
  eight internal destinations, 17 anchors, 26 assets, metadata, 404s, robots, sitemap,
  shared primary-heading markup, one background per route, and no equation overlays.

## Remaining browser verification

The Browser runtime reported no connected browser. Tests use simulated browser
events and server rendering, so no rendered screenshots, console inspection,
actual overflow measurements, or FPS/memory benchmarks are claimed.

Manual QA still needs to exercise 320/390/768/1024/1440 px viewports, the full
Home → Projects → About → Contact → Home navigation cycle, back/forward, direct
loads and refreshes, scroll reveals on each page and case study, rapid navigation,
project filters, keyboard focus, reduced motion, pause/resume, tab suspension,
cursor interaction, and visual continuity of the background. The real portrait
is not supplied; its replacement path is covered with server-rendered fixtures.
