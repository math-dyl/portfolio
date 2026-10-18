# Project navigation fix

## Diagnosis and root cause evidence

The application uses Next.js App Router, not React Router. The full flow is
`src/data/projects.ts` → `ProjectGrid` → `ProjectCard` → Next `Link` / the exit
animation in `PageTransition` → `src/app/projects/[slug]/page.tsx` → `getProject`
→ the hero, specifications, sections and gallery. Featured cards and the
filtered collection use the same grid and data.

All four existing slugs are unique and match their route. The detail page
already awaits promised params and calls `notFound()` before reading missing
project properties. Decorative backgrounds already use `pointer-events: none`.

Confirmed problems:

- The initial typecheck failed on malformed generated `.next/dev/types/routes.d.ts`
  and `validator.ts` files. The stale route declaration also omitted the dynamic
  project route. Starting Next regenerated valid files. Typechecking now runs
  `next typegen` first, rather than trusting cached generated declarations.
- Card image, title and View project links worked, but the description, badges
  and padding had no destination. The existing action now covers the card.
- Missing cover data was dereferenced directly. Image failures had no fallback;
  source/demo URLs and collection fields were consumed without validation.
- The exit handler prevented the click before attempting its animation. A
  thrown animation error could therefore cancel navigation. Animation failure
  now leaves normal Link navigation intact; a synchronous router failure
  restores visible content and falls back to the same URL.
- Existing development logs contained Next's smooth-scroll configuration
  warning. The root HTML now explicitly opts into Next's scroll override.

The user confirmed the error occurs with `npm run dev`. The original clicked
browser crash was not reproduced: all four project pages returned the correct
content on the freshly started development server even before source changes.
The malformed cache is confirmed; attributing the reported browser crash to it
would be an inference. No connected browser was available to capture the exact
client error or verify that attribution.

## Fix and routing/data changes

- Preserve all four project titles, slugs, content, category order, images and
  the existing black theme, responsive rules, hover effects and reveal timing.
- Extend the existing View project anchor with a card-sized pseudo-element.
  Image/title/source/demo anchors remain above it; no nested anchors or custom
  card click handlers were added.
- Keep `slug` as the single identifier. `projectHref` supplies card, canonical
  and sitemap paths. The route remains `/projects/[slug]`.
- Normalize authoring data once into the shared catalog. Missing descriptions
  receive a fallback; malformed lists become empty; invalid entries and later
  duplicate slugs are excluded so other projects remain usable.
- Only valid absolute HTTP(S) project URLs become external actions. They use
  native anchors with `target="_blank"` and `rel="noopener noreferrer"`.
- Cover images are optional. The shared image component uses a local placeholder
  after a missing or failed image, without retries cycling between sources.
  This portfolio continues to use local `public/` image paths; unsupported
  remote sources are excluded. Missing covers use the branded metadata image.
- Preserve the existing pathname-based scroll reset, focus restoration, hash
  behavior, history handling, persistent background and destination reveals.
- Keep the existing Next server deployment. Direct URLs work without an SPA
  rewrite; no deployment architecture changes were necessary.

## Files modified or added

| Area | Files |
| --- | --- |
| Data and types | `src/types/project.ts`, `src/data/projects.ts`, new `src/lib/projects.ts` |
| Project rendering | `src/components/projects/ProjectCard.tsx`, `ProjectHero.tsx`, `ProjectGallery.tsx`, new `ProjectImage.tsx` |
| Navigation and styling | `src/components/ui/Button.tsx`, `src/components/ui/PageTransition.tsx`, `src/app/globals.css`, `src/app/layout.tsx` |
| Routing and metadata | `src/app/projects/[slug]/page.tsx`, `src/app/sitemap.ts` |
| Asset | new `public/images/projects/placeholder.svg` |
| Validation | `scripts/check-routes.mjs`, `tests/animation.test.mjs`, new `tests/projects.test.mjs`, new `tests/helpers/load-source.mjs`, `package.json` |
| Documentation | `README.md`, this report |

Next itself refreshed `next-env.d.ts` and created `AGENTS.md` / `CLAUDE.md`
when the development server started. Existing unrelated uncommitted changes
were preserved. No dependencies were added.

## Errors resolved and projects tested

All checks passed:

- `npm.cmd run lint`
- `npm.cmd run typecheck` (route generation and strict TypeScript)
- `npm.cmd test`: 38 tests, including nine added project/navigation tests
- `npm.cmd run build`: all four project detail routes prerender successfully
- `node scripts/check-routes.mjs http://127.0.0.1:3000`: development HTTP checks
- `node scripts/check-routes.mjs http://127.0.0.1:3001`: production HTTP checks

Each project was individually checked through its card destination, data lookup,
promised route params, intended heading, metadata, collection return link,
direct HTTP request, repeated direct request and RSC navigation response:

| Project | URL |
| --- | --- |
| Discord LMS | `/projects/discord-lms` |
| GABAY AI | `/projects/gabay-ai` |
| DangalSPOT | `/projects/dangalspot` |
| Mathdyl Tutorial | `/projects/mathdyl-tutorial` |

The route script discovers cards and sitemap entries rather than maintaining
a separate hardcoded project list. Production checks passed for eight content
pages, eight internal destinations, 17 local anchors, 26 assets, the fallback
image, invalid-route 404s, robots and sitemap. Valid project navigation responses
contain the intended title and no RSC rendering error records.

## Regression checks and remaining issues

Home, Projects, About and Contact passed HTTP checks, including shared navigation
active states, accessible icons, visible server-rendered headings, single
background instances and linked assets. Existing simulated event tests pass for
rapid navigation, modified clicks, route commits, history, scroll resets, hash
links, compact/mobile navigation, reduced motion, background/sphere lifecycle
and reveal recovery. New tests cover malformed/duplicate data, unsafe URLs,
missing covers/gallery items, failed images, invalid project slugs and animation
or router failures.

Browser-rendered desktop/mobile clicks, back/forward, actual browser refresh,
hydration/console output, visual hit testing during reveals, and external-site
availability remain unverified because no browser was connected. Repeated HTTP
requests and simulated events do not replace those checks. The original local
browser crash still needs its exact error if it persists after restarting the
development server. Example slugs such as `mathdyl-academy`, `gabay` and
`study-tracker` are absent from the existing catalog and correctly use the safe
not-found behavior; no projects or aliases were invented.
