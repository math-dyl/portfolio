# Page scroll reset and compact icon navigation

The existing Next App Router, transitions, fade-up reveals, animated background,
black theme, typography, content, and contact configuration are preserved.
No dependencies were added.

## Page changes

`PageTransition` explicitly passes `{ scroll: true }` to intercepted router
pushes. A pathname layout effect resets the viewport to `{ top: 0, left: 0,
behavior: "instant" }` when a different page commits, before Intersection
Observer handles the destination's reveals. This avoids the router's heuristic
scroll preservation and the site's global smooth-scroll setting. The scroll
reset adds no delay or timer; the existing exit timing remains unchanged.

This applies to all main pages, case studies, logo links, mobile links, and
back/forward pathname changes. Reduced motion and paused animations retain
the reset. Initial visits preserve browser positioning, hash links preserve
anchor scrolling, and same-path component updates leave scroll unchanged.
Same-page link clicks return to the top and cancel a previously pending exit.
Modified clicks, external links, downloads, and alternate targets retain their
normal behavior.

## Navigation states

The existing Brand supplies both M and Mathdyl; only the navbar's name span
collapses. The same four route links contain Lucide icons, visual text labels,
dark tooltip labels, explicit accessible names, and existing `aria-current`
indicators. The active background and underline work in both states.

The full-width surface becomes a centered 300 px icon bar, clamped to the
available width. Its width, height, padding, gaps, text, and icons transition
with the existing 380 ms easing. The sticky slot keeps its original geometry,
so downstream content does not shift. Empty space around the compact surface
does not receive pointer events or unexpectedly expand it.

Desktop fine-pointer hover and keyboard focus restore labels. Tooltip visibility
hands over to labels when the width transition completes. Reduced motion
restores labels immediately and suppresses redundant desktop tooltips.
Pointer focus does not force a touch user into a moving expanded bar.

At 768–980 px, tighter spacing preserves the full navigation. Below 768 px,
the normal bar retains the mobile menu and the scrolled bar exposes the four
icon links directly. Focused compact links stay visible, and returning to the
top restores the normal mobile bar. Links retain 44 px minimum targets. The
compact surface fits inside the 288 px header area at a 320 px viewport.

## Verification

- ESLint and TypeScript passed.
- The optimized production build passed for all routes.
- All 29 regression tests passed. Added coverage checks every destination,
  history-style pathname changes, hash handling, reduced motion, same-page
  resets, cancelled exits, accessible icon mappings, active states, and
  tooltip handoff. Existing background and reveal lifecycle tests still pass.
- Production HTTP checks passed for eight pages, eight internal destinations,
  17 anchors, 26 assets, 404s, robots, and sitemap. Every page is also checked
  for all four vector icons, accessible labels, tooltips, and correct active
  navigation state.
- Git whitespace checks passed.

The Browser runtime returned no connected browsers. Actual rendered scroll
positions, hover timing, viewport overflow, touch clicks, console output, and
frame rate have not been browser-verified. These checks remain necessary to
confirm visual behavior at 320/390/768/1024/1440 px, during rapid navigation,
and with reduced motion. The production preview uses
`http://127.0.0.1:3014`.
