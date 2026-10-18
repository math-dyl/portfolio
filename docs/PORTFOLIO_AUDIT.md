# Portfolio audit — 9 October 2026

## Scope

Retained the existing Next.js App Router, React, TypeScript, Tailwind, Lucide, monochrome design, content, routes, projects, skills, contact details, and preview assets. Existing uncommitted changes were preserved. No dependencies were added or upgraded.

## Findings and changes

| Finding | Change | Verification |
| --- | --- | --- |
| Original lint failures in Reveal and RevealText | Removed synchronous effect state and mutable render-time delay calculation | ESLint |
| Server-rendered reveals started invisible; large containers could miss a 12% intersection threshold | Visible default, enhancement-only pending class, zero threshold, observer fallback, live reduced-motion handling | Simulated observer tests and production HTML checks |
| Word animation delays were placed on the wrapper while the animated child inherited from an undelayed parent | Delay now lives directly on each animated word | Source review; rendered timing remains unverified |
| Mobile menu could remain open across desktop resize or history navigation | Close on breakpoint/history, Escape, outside click, focus exit and link activation; restore toggle focus on Escape/link activation | Simulated event tests and listener cleanup assertions |
| Cards lacked flexible content alignment; completed reveal transforms could mask hover transforms | Flex columns align card bottoms; card reveal animates opacity separately from hover transforms | CSS review; rendered sizing and hover behavior remain unverified |
| Some link/filter/menu targets were small | Minimum 44px targets for shared text actions, filters, footer, back links, menu and project actions | CSS review |
| Projects listing skipped directly from h1 to card h3 headings | Added a visually hidden h2 for the project collection | Source and production HTML review |
| Disabling sphere animation removed its centering transform | Explicit static sphere/ring transforms for reduced motion and paused animation | CSS review; rendered confirmation remains outstanding |

## Background and performance

- One decorative canvas behind the content with `pointer-events: none` and explicit stacking layers; existing local grids stay in place.
- Controlled pool of 20–68 particles across three depth layers. Particles recycle in place with subtle upward movement, sinusoidal drift, and small glows drawn without canvas shadow blur.
- Fine mouse pointers receive a small parallax/repulsion response; touch/coarse pointers are excluded. Scroll depth is bounded and affects the canvas only.
- One requestAnimationFrame loop, no per-frame React state, capped elapsed time, device pixel ratio capped at 2, and approximately eight million backing pixels maximum.
- Visibility changes suspend/resume the loop. Reduced-motion changes stop motion and clear parallax. Forced colors hide decoration.
- Footer pause/resume preserves the particle pool and disables existing CSS animations. Canvas/event/media/observer cleanup is tested.
- Replaced duplicated section-level particle/glow effects; RevealText is now a server component.

## UI, responsive design and accessibility

Preserved typography, palette, existing sections and content. Added shared container, spacing, radius and transition tokens. Cards use consistent images and flexible content, subtle 220ms feedback, and matching keyboard feedback. Decorative orbital geometry is clipped to its container. Short mobile viewports have a scrollable navigation panel. Existing responsive grids and contact wrapping are retained.

Maintained skip navigation, semantic routes, focus outlines, labelled controls, image alt text, external-link protection, and unavailable contact states. Added an accessible animation control, dynamic motion preferences, touch handling, and a collection heading. Automatic reduced motion is never overridden by the pause control.

## Files changed in this task

- `src/app/layout.tsx`, `src/app/globals.css`, `src/app/projects/page.tsx`
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`
- `src/components/ui/TechBackdrop.tsx`, `src/components/ui/Reveal.tsx`, `src/components/ui/RevealText.tsx`
- New `src/components/ui/AntigravityBackground.tsx`, `src/components/ui/MotionPreference.tsx`, `src/lib/antigravity.ts`
- `package.json`, `README.md`
- New `tests/animation.test.mjs`, `scripts/check-routes.mjs`, and this report
- `next-env.d.ts` is automatically updated by Next.js to reference production-generated route types during the build.

Pre-existing changes in About, Contact and home components are retained; they are not attributed to this audit.

## Verification and remaining work

- ESLint and TypeScript: pass.
- Automated regression tests: 10 pass, covering pool bounds, recycling, suspend/resume, preferences, touch/pointer response, resize budget, scroll depth, reveal fallback, navigation and cleanup.
- Production build: pass; all content routes generated.
- Running production server: eight pages, eight internal destinations, 17 anchors, 25 assets, two invalid-route 404 responses, robots and sitemap pass HTTP checks. Referenced images and social previews return 200.
- A connected browser was unavailable. Console/hydration checks, filter/button interactions in the actual browser, external GitHub navigation/email-client launch, viewport rendering/overflow measurements, visual contrast review, pointer feel, and measured FPS remain unverified. Simulated events and source review are not presented as browser QA.
- LinkedIn remains unconfigured, project case studies remain marked as samples, and repository/demo URLs remain absent where no real destination was supplied. Existing email and GitHub destinations are preserved. The site origin still defaults to localhost unless NEXT_PUBLIC_SITE_URL is configured.

To repeat the checks: run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Start production with `npm start`, then run `node scripts/check-routes.mjs` in another terminal. Use `npm.cmd` on PowerShell if npm.ps1 is blocked.
