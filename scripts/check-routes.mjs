import assert from "node:assert/strict";

// Run against an already-running production server: node scripts/check-routes.mjs [origin]
const origin = new URL(process.argv[2] || "http://127.0.0.1:3000");
const assets = new Set();
const destinations = new Set();
let anchors = 0;
const decode = value => value.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
const sitemap = await fetch(new URL("/sitemap.xml", origin));
assert.equal(sitemap.status, 200);
const sitemapXml = await sitemap.text();
const routes = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(decode(match[1])).pathname);
assert.equal(new Set(routes).size, routes.length, "Sitemap has unique destinations");
for (const route of ["/", "/about", "/contact", "/projects"]) assert.ok(routes.includes(route), `Sitemap includes ${route}`);
const projectRoutes = routes.filter(route => route.startsWith("/projects/"));
assert.ok(projectRoutes.length, "Sitemap includes project detail routes");
const projectTitles = new Map();
// Discover the collection from its actual rendered cards, rather than keeping
// a second hardcoded list of slugs that becomes stale when projects are added.
const listing = await fetch(new URL("/projects", origin));
assert.equal(listing.status, 200);
const listingHtml = await listing.text();
for (const match of listingHtml.matchAll(/<h3><a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a><\/h3>/g)) {
  projectTitles.set(decode(match[1]), decode(match[2]));
}
assert.deepEqual([...projectTitles.keys()].sort(), [...projectRoutes].sort(), "Every rendered card has a detail route");

for (const route of routes) {
  const response = await fetch(new URL(route, origin));
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert.ok(!html.includes('id="__next_error__"'), `${route}: no server rendering error`);
  assert.ok(html.includes('data-scroll-behavior="smooth"'), `${route}: router manages smooth scroll`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route}: one primary heading`);
  assert.ok(html.includes('id="main-content"'), `${route}: skip-link target`);
  assert.ok(html.includes('class="antigravity-background" aria-hidden="true"'), `${route}: decorative background`);
  assert.ok(!html.includes('class="reveal is-pending'), `${route}: SSR content remains visible`);
  assert.ok(/<h1[^>]*class="[^"]*reveal-heading/.test(html), `${route}: shared fade-up heading reveal`);
  assert.ok(!/profile-portrait|portrait-frame|portrait-placeholder|portal-ring|hero-instrument|Profile image placeholder/.test(html), `${route}: no profile UI or surrounding card`);
  assert.ok(!/sphere-formula|sphere-coordinate|backdrop-crosshair/.test(html), `${route}: no decorative equations or text symbols`);
  assert.equal((html.match(/class="antigravity-background"/g) || []).length, 1, `${route}: one persistent background`);
  const navigation = html.match(/<nav\b[^>]*aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(navigation, `${route}: primary navigation`);
  assert.equal((navigation.match(/class="[^"]*\bnav-icon\b[^"]*"/g) || []).length, 4, `${route}: four vector navigation icons`);
  assert.equal((navigation.match(/class="nav-tooltip"/g) || []).length, 4, `${route}: icon tooltip labels`);
  for (const [href, label] of [["/", "Home"], ["/projects", "Projects"], ["/about", "About"], ["/contact", "Contact"]]) {
    const link = [...navigation.matchAll(/<a\b[^>]*>/g)].find(match => match[0].includes(`href="${href}"`))?.[0];
    assert.ok(link?.includes(`aria-label="${label}"`), `${route}: accessible ${label} icon`);
    const active = href === "/" ? route === "/" : route === href || route.startsWith(href + "/");
    assert.equal(link.includes('aria-current="page"'), active, `${route}: ${label} active state`);
  }
  assert.ok(/<link[^>]*rel="canonical"/.test(html), `${route}: canonical URL`);
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)) {
    const url = new URL(decode(match[1]), new URL(route, origin));
    if (url.origin !== origin.origin) {
      assert.ok(["https:", "mailto:"].includes(url.protocol), `${route}: valid external protocol`);
      if (match[0].includes('target="_blank"')) assert.ok(/rel="[^"]*noopener[^\"]*"/.test(match[0]), "external link protection");
      continue;
    }
    destinations.add(url.pathname);
    if (url.hash && url.pathname === route) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(html.includes(`id="${id}"`), `${route}: anchor ${url.hash}`);
      anchors++;
    }
  }
  for (const match of html.matchAll(/<(?:img|script)\b[^>]*src="([^"]+)"/g)) assets.add(decode(match[1]));
  for (const match of html.matchAll(/<link\b[^>]*href="([^"]+)"[^>]*>/g)) {
    if (/rel="(?:stylesheet|icon)"/.test(match[0])) assets.add(decode(match[1]));
  }
  for (const match of html.matchAll(/<meta\b[^>]*property="og:image"[^>]*content="([^"]+)"/g)) {
    assets.add(new URL(decode(match[1])).pathname);
  }
  assert.ok(!/<img\b(?![^>]*\balt=")[^>]*>/.test(html), `${route}: all images have alt text`);
  if (projectTitles.has(route)) {
    const title = projectTitles.get(route);
    const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
    assert.ok(decode(heading || "").includes(title), `${route}: intended project heading`);
    assert.ok(/<a\b[^>]*class="back-link"[^>]*href="\/projects"/.test(html), `${route}: back to collection`);
    const refresh = await fetch(new URL(route, origin), { cache: "no-store" });
    assert.equal(refresh.status, 200, `${route}: repeated direct request`);
    assert.ok((await refresh.text()).includes('id="main-content"'), `${route}: refresh content`);
    const navigation = await fetch(new URL(route, origin), { headers: { RSC: "1" } });
    assert.equal(navigation.status, 200, `${route}: client navigation response`);
    assert.ok(navigation.headers.get("content-type")?.includes("text/x-component"), `${route}: RSC payload`);
    const payload = await navigation.text();
    assert.ok(!/(?:^|\n)[\da-f]+:E\{/.test(payload), `${route}: no RSC rendering errors`);
    assert.ok(payload.includes(title), `${route}: navigation resolves intended project`);
  }
}

for (const route of destinations) {
  const response = await fetch(new URL(route, origin));
  assert.equal(response.status, 200, `Internal link: ${route}`);
}
for (const asset of assets) {
  const response = await fetch(new URL(asset, origin));
  assert.equal(response.status, 200, `Asset: ${asset}`);
}
for (const route of ["/does-not-exist", "/projects/does-not-exist", "/projects/undefined", "/projects/null", "/projects/gabay-ai/extra"]) {
  const response = await fetch(new URL(route, origin));
  assert.equal(response.status, 404, route);
}
assert.equal((sitemapXml.match(/<loc>/g) || []).length, routes.length);
assert.equal((await fetch(new URL("/images/projects/placeholder.svg", origin))).status, 200, "Missing image fallback asset");
const robots = await fetch(new URL("/robots.txt", origin));
assert.equal(robots.status, 200);
assert.ok((await robots.text()).includes("Sitemap:"));
console.log(`Passed: ${routes.length} pages, ${projectRoutes.length} project detail/refresh/RSC responses, ${destinations.size} internal destinations, ${anchors} anchors, ${assets.size} assets, fallback image, 404s, robots and sitemap.`);
