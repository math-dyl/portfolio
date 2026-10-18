# Shared fade-up motion and scroll navigation

The existing black theme, typography, content, route structure, controls, and
continuous background remain in place. No dependencies were added.

`src/lib/motion.ts` owns the 750 ms duration, 30 px travel, 100 ms stagger,
shared easing, observer configuration, and navbar settings. Existing Home,
Projects, About, Contact, case-study, and footer components retain their shared
Reveal owners. The hero caption, project-filter empty state, and 404 page now
use the same system. Related card content moves together, preserving nested
hover effects.

`Reveal` prepares animations before paint, observes at a 0.1 threshold with
`0px 0px -8% 0px` root margin, and reveals once. It disconnects observation
after intersection and clears animation fill after completion. Missing or
throwing observers, missing initial observer callbacks, reduced motion, the
pause control, and keyboard focus all show content immediately or through the
recovery timeout. Cleanup removes timers, observers, and element listeners.
The existing MotionProvider handles live preference changes centrally.

The head bootstrap prevents a visible-to-hidden flash before hydration.
Content is visible with JavaScript disabled or the bootstrap blocked. If
hydration takes more than two seconds, content is released and late hydration
keeps that initial route static. Later destinations still animate normally.
The HTML hydration-warning suppression is scoped to the root whose bootstrap
data attributes are intentionally changed before React initializes.

The existing PageTransition keys only page content by pathname. Direct loads,
refreshes, link navigation, and history changes initialize destination reveals;
component updates retain their completed reveal state. Root navigation and
the background remain mounted. Existing exit motion and navigation recovery
remain intact.

Navbar scroll input is passive and batched through requestAnimationFrame.
It changes a data attribute without React state updates. Compaction begins
above 100 px and persists until 80 px to avoid boundary jitter. The surface
changes from 72 to 56 px on desktop and 66 to 58 px on mobile over 380 ms.
The sticky slot keeps its original size, so surrounding content stays still.
Fine-pointer hover, keyboard focus, and an open mobile menu expand the surface.
All links remain visible and touch controls retain 44 px minimum targets.
Reduced motion disables transitions.

## Verification

- ESLint passed.
- TypeScript passed, including the production build's type check.
- Production build passed for all routes.
- All 25 regression tests passed, including observer failures, hydration
  recovery, keyboard access, scroll batching, threshold hysteresis, restored
  scroll positions, route commits, modified clicks, and listener cleanup.
- Production HTTP checks at `http://127.0.0.1:3014` passed: eight pages, eight
  internal destinations, 17 anchors, 26 assets, 404s, robots, and sitemap.
- Git whitespace validation passed.

No browser was connected to the Browser runtime. Rendered desktop/mobile
layouts, hover timing, actual back/forward scroll restoration, console output,
and measured frame rate have not been visually verified. Browser QA should
cover 320/390/768/1024/1440 px widths, all four main routes and case studies,
hover/focus expansion, mobile menus, direct visits, rapid navigation, history,
filters, reduced motion, pause/resume, and JavaScript-disabled content.
