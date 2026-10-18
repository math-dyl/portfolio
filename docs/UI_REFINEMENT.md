# Portfolio UI refinement

Implemented October 9, 2026 on the existing Next.js portfolio. The black theme,
content, project data, routing, destinations, and functionality are preserved.
No dependencies were added.

## Hero cleanup

Removed `ProfilePortrait`, its placeholder, circular frame, portal rings, glow,
surrounding card, profile configuration, and obsolete setup file. Unused portrait
CSS, animation keyframes, imports, and responsive rules are removed. No portrait
image was present to delete.

The hero now pairs the existing introduction with an unboxed geometric sphere.
Adjusted spacing and reserved square geometry keep the visual column occupied
by actual content. The responsive grid becomes one column below 900 px; the
sphere is centered and limited to 320 px on mobile. The primary text and CTAs
retain their content and destinations.

## Shared motion and interactions

`src/lib/motion.ts` centralizes 650 ms fade-up entrances, 80 ms stagger increments,
and `cubic-bezier(.22, 1, .36, 1)` easing. Content moves 36 px and headings 24 px;
below 768 px these reduce to 20 px and 16 px. Entrances animate opacity and
transform without blur or layout changes.

`Reveal` observes each element once and disconnects after intersection.
`RevealText` gives headings one shared entrance and preserves accessible text,
line breaks, and silver styling. Home, About, Projects, Contact, case studies,
skills, cards, screenshots, badges, CTA groups, and footer content use these
primitives. Existing content groups reveal together where separately animating
children would duplicate parent motion. Card and contact-channel staggers use
the same 80 ms increments.

`PageTransition` supplies a 240 ms content exit. Destination reveals own the
entrance. Modified clicks, anchors, downloads, external links, rapid navigation,
history, focus transfer, and failed-navigation recovery are covered by tests.
The persistent background remains outside route content.

Project cards lift 4 px with a 1.01 scale, brighter border, and restrained glow.
Buttons have hover/focus lift, icon movement, border/background transitions,
press feedback, and visible keyboard outlines. Touch hover transforms are
disabled, and contact links receive subtle matching feedback.

## Living background and accessibility

The foundation remains #050505. Independent slow radial-light and grid drift,
sparse particles in three depth layers, bounded scroll parallax, and eased
desktop pointer light provide continuous depth. There are no page-specific
background instances. Mobile uses lower light intensity and particle limits;
cursor effects are disabled below 768 px.

Canvas frames do not update React state. Particle counts, connection counts,
pixel density, and canvas memory are bounded. Sphere buffers are reused and
its loop stops offscreen. Hidden tabs stop canvas loops and CSS atmosphere
animations; listeners, observers, and frames are cleaned up on unmount.

Reduced motion and the footer pause control show content immediately and stop
unnecessary motion. Completed reveals stay visible on resume. Forced colors
hide decoration. Server-rendered content remains visible without JavaScript;
missing Canvas or observer APIs have static fallbacks.

## Executed validation

- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: all 22 regression tests passed.
- `npm.cmd run build`: passed, including production TypeScript and generation.
- `node scripts/check-routes.mjs http://127.0.0.1:3012`: passed for eight pages,
  eight internal destinations, 17 anchors, 26 assets, metadata, 404s, robots,
  and sitemap. Every page has shared heading markup, one background instance,
  visible server-rendered content, and no profile UI or surrounding card markup.
- `git diff --check`: passed.

The production preview is available at http://127.0.0.1:3012 while the local
server remains running.

## Remaining visual verification

The Browser runtime returned no connected browsers. Automated tests use
simulated browser events and server rendering. Rendered layout, viewport
overflow, console inspection, visual navigation continuity, and measured FPS
have therefore not been verified.

Manual QA should cover 320/390/768/1024/1440 px viewports, Home → Projects →
About → Contact → Home, back/forward, direct loads and refreshes, scroll reveals
on every page and case study, rapid navigation, project filters, keyboard use,
reduced motion, pause/resume, tab suspension, and desktop pointer interaction.
