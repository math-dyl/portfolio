import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadSource } from "./helpers/load-source.mjs";

const { normalizeProjects, externalProjectUrl, projectHref } = loadSource("src/lib/projects.ts", {}, { URL });
const { projects, getProject } = loadSource("src/data/projects.ts", {}, { URL });
const image = ({ src, alt, width, height, className }) => createElement("img", { src, alt, width, height, className });
const reveal = ({ as = "div", children, className }) => createElement(as, { className }, children);
const link = ({ children, ...props }) => createElement("a", props, children);
const overrides = {
  "next/image": { __esModule: true, default: image },
  "next/link": { __esModule: true, default: link },
  "@/components/ui/Reveal": { Reveal: reveal },
  "@/config/site": { site: { name: "Fixture", url: "https://portfolio.test" } },
};

test("every existing project has one canonical identifier shared by cards and routes", () => {
  assert.ok(projects.length > 0);
  assert.equal(new Set(projects.map(project => project.slug)).size, projects.length);
  const { ProjectCard } = loadSource("src/components/projects/ProjectCard.tsx", overrides, { URL });
  for (const project of projects) {
    assert.equal(getProject(project.slug)?.title, project.title);
    const html = renderToStaticMarkup(createElement(ProjectCard, { project }));
    assert.equal((html.match(new RegExp(`href="${projectHref(project)}"`, "g")) || []).length, 3);
    assert.ok(html.includes(`aria-label="View ${project.title} case study"`));
    assert.ok(!html.includes("/projects/undefined"));
  }
});

test("incomplete presentation data renders cards and details with safe defaults", () => {
  const [project] = normalizeProjects([{ slug: "minimal", title: "Minimal project" }]);
  assert.equal(project.technologies.length, 0);
  assert.equal(project.categories.length, 0);
  assert.ok(project.description);
  assert.ok(project.shortDescription);
  const { ProjectCard } = loadSource("src/components/projects/ProjectCard.tsx", overrides, { URL });
  const { ProjectHero } = loadSource("src/components/projects/ProjectHero.tsx", overrides, { URL });
  for (const Component of [ProjectCard, ProjectHero]) {
    const html = renderToStaticMarkup(createElement(Component, { project }));
    assert.ok(html.includes('/images/projects/placeholder.svg'));
    assert.ok(html.includes("Minimal project preview unavailable"));
  }
});

test("malformed entries, unsafe slugs and duplicate identifiers do not break valid peers", () => {
  const catalog = normalizeProjects([
    null, undefined, {}, { slug: 1, title: "Invalid" },
    { slug: "../about", title: "Invalid" }, { slug: "bad?query", title: "Invalid" },
    { slug: "Bad-Case", title: "Invalid" }, { slug: "no-title" },
    { slug: "valid", title: "First", categories: null, technologies: "React", features: [null, "Search", "Search"] },
    { slug: "valid", title: "Duplicate" },
    { slug: "next", title: "Next", technologies: [null, 1, "React", "React"], categories: ["Education", "Software", "Bogus", "Education"] },
  ]);
  assert.deepEqual(Array.from(catalog, project => project.slug), ["valid", "next"]);
  assert.deepEqual(Array.from(catalog[0].features), ["Search"]);
  assert.deepEqual(Array.from(catalog[1].technologies), ["React"]);
  assert.deepEqual(Array.from(catalog[1].categories), ["Education", "Software"]);
  assert.equal(catalog[0].title, "First");
});

test("external destinations accept absolute HTTP(S) URLs and reject missing or unsafe URLs", () => {
  for (const value of [undefined, null, "", "https://", "/demo", "//example.com", "javascript:alert(1)", "data:text/html,test", "https://user:pass@example.com"]) {
    assert.equal(externalProjectUrl(value), undefined, String(value));
  }
  assert.equal(externalProjectUrl(" https://example.com/demo?q=1 "), "https://example.com/demo?q=1");
  assert.equal(externalProjectUrl("http://localhost:4000"), "http://localhost:4000/");
  const [project] = normalizeProjects([{ slug: "links", title: "Links", githubUrl: "javascript:alert(1)", liveUrl: "https://example.com/demo" }]);
  const { ProjectCard } = loadSource("src/components/projects/ProjectCard.tsx", overrides, { URL });
  const { ProjectHero } = loadSource("src/components/projects/ProjectHero.tsx", overrides, { URL });
  for (const Component of [ProjectCard, ProjectHero]) {
    const html = renderToStaticMarkup(createElement(Component, { project }));
    assert.ok(!html.includes("javascript:"));
    assert.equal((html.match(/target="_blank"/g) || []).length, 1);
    assert.ok(html.includes('rel="noopener noreferrer"'));
  }
});

test("invalid cover and gallery images are omitted before reaching next/image", () => {
  const [project] = normalizeProjects([{
    slug: "images", title: "Images", coverImage: { src: "https://unconfigured.example/cover.png" },
    images: [null, {}, { src: "//example.com/image.png" }, { src: "/images/local.svg" }],
  }]);
  assert.equal(project.coverImage, undefined);
  assert.equal(project.images.length, 1);
  assert.equal(project.images[0].alt, "Images preview");
});

test("a failed image switches to a local placeholder without retry loops and permits a new source", () => {
  let state;
  const { ProjectImage } = loadSource("src/components/projects/ProjectImage.tsx", {
    react: { useState: () => [state, value => { state = value; }] },
    "next/image": { __esModule: true, default: image },
  });
  const props = { image: { src: "/missing.png", alt: "Missing" }, title: "Example", width: 1000, height: 650 };
  let rendered = ProjectImage(props);
  assert.equal(rendered.props.src, "/missing.png");
  rendered.props.onError();
  rendered = ProjectImage(props);
  assert.equal(rendered.props.src, "/images/projects/placeholder.svg");
  assert.equal(rendered.props.alt, "Example preview unavailable");
  rendered.props.onError();
  assert.equal(ProjectImage(props).props.src, "/images/projects/placeholder.svg");
  assert.equal(ProjectImage({ ...props, image: { src: "/valid.png", alt: "Valid" } }).props.src, "/valid.png");
});

test("all project detail pages resolve promised params and invalid slugs use notFound", async () => {
  const notFound = new Error("notFound");
  const route = loadSource("src/app/projects/[slug]/page.tsx", {
    ...overrides,
    "next/navigation": { notFound() { throw notFound; } },
  }, { URL });
  assert.deepEqual(Array.from(route.generateStaticParams(), item => item.slug), Array.from(projects, item => item.slug));
  for (const project of projects) {
    const props = { params: Promise.resolve({ slug: project.slug }) };
    const page = await route.default(props);
    const hero = page.props.children[0].props.children[0];
    assert.equal(hero.props.project.title, project.title);
    const metadata = await route.generateMetadata(props);
    assert.equal(metadata.alternates.canonical, projectHref(project));
  }
  for (const slug of ["does-not-exist", "gabay", "mathdyl-academy", "study-tracker", "undefined", undefined]) {
    assert.equal(getProject(slug), undefined);
    await assert.rejects(route.default({ params: Promise.resolve({ slug }) }), error => error === notFound);
  }
});

test("detail metadata uses the social preview when a cover is absent", async () => {
  const [project] = normalizeProjects([{ slug: "minimal", title: "Minimal" }]);
  const route = loadSource("src/app/projects/[slug]/page.tsx", {
    ...overrides, "@/data/projects": { projects: [project], getProject: () => project },
  }, { URL });
  const metadata = await route.generateMetadata({ params: Promise.resolve({ slug: "minimal" }) });
  assert.equal(metadata.openGraph.images[0].url, "/images/social/mathdyl.png");
});
