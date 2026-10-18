import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { createRequire } from "node:module";
import { loadSource } from "./helpers/load-source.mjs";

const runtimeRequire = createRequire(import.meta.url);

function events() {
  const listeners = new Map();
  return {
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
    },
    removeEventListener(name, callback) { listeners.get(name)?.delete(callback); },
    emit(name, event = {}) { for (const callback of listeners.get(name) || []) callback(event); },
    count() { return [...listeners.values()].reduce((sum, set) => sum + set.size, 0); },
  };
}

function mountBackground({ paused = false, reduced = false, fine = true, width = 1000, height = 800, contextAvailable = true, hardwareConcurrency = 8, random = () => 0.4 } = {}) {
  const motion = { ...events(), matches: reduced };
  const pointer = { ...events(), matches: fine };
  const window = {
    ...events(), innerWidth: width, innerHeight: height, devicePixelRatio: 4, scrollY: 0,
    matchMedia: query => query.includes("pointer: fine") ? pointer : motion,
  };
  const document = { ...events(), hidden: false };
  const arcs = [];
  const lights = [];
  const edges = [];
  const context = {
    clearRect() { arcs.length = 0; lights.length = 0; edges.length = 0; }, setTransform() {}, beginPath() {}, fill() {},
    moveTo(x, y) { edges.push({ x, y }); }, lineTo() {}, stroke() {},
    arc(x, y, radius) { arcs.push({ x, y, radius }); },
    createRadialGradient() { return { addColorStop() {} }; },
    fillRect(x, y, width, height) { lights.push({ x, y, width, height }); },
  };
  const canvas = { getContext: () => contextAvailable ? context : null };
  const frames = new Map();
  let frameId = 0;
  let effects = [];
  let referenceIndex = 0;
  const refs = [];
  let preference = { paused, reduced };
  const { AntigravityBackground } = loadSource("src/components/ui/AntigravityBackground.tsx", {
    react: {
      useRef: initial => {
        const index = referenceIndex++;
        if (!refs[index]) refs[index] = { current: index === 0 ? canvas : initial };
        return refs[index];
      },
      useEffect: callback => { effects.push(callback); },
    },
    "@/components/ui/MotionPreference": { useMotionPreference: () => preference },
  }, {
    window, document,
    navigator: { hardwareConcurrency },
    Math: Object.assign(Object.create(Math), { random }),
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  const element = AntigravityBackground();
  const cleanups = effects.map(effect => effect());
  const cleanup = () => cleanups.forEach(callback => callback?.());
  return {
    window, document, motion, pointer, canvas, frames, arcs, lights, edges, cleanup, element,
    setPreference(next) {
      preference = next;
      effects = [];
      referenceIndex = 0;
      AntigravityBackground();
      effects[0]();
    },
    tick(time) {
      assert.equal(frames.size, 1, "Exactly one animation frame should be queued");
      const [id, callback] = frames.entries().next().value;
      frames.delete(id);
      callback(time);
    },
  };
}

test("particle pool stays bounded across mobile, tablet and large screens", () => {
  const { createParticlePool } = loadSource("src/lib/antigravity.ts");
  for (const [width, height] of [[320, 700], [768, 1024], [1440, 900], [3840, 2160]]) {
    const pool = createParticlePool(width, height);
    assert.ok(pool.length >= 20 && pool.length <= 68);
    assert.equal(new Set(pool.map(particle => particle.depth)).size, 3);
    for (const particle of pool) {
      assert.ok(particle.x >= 0 && particle.x <= width);
      assert.ok(particle.y >= 0 && particle.y <= height);
      assert.ok(particle.opacity < 0.4 && particle.speed > 0);
    }
  }
});

test("particles recycle in place and clamp elapsed time after suspension", () => {
  const { createParticlePool, advanceParticles } = loadSource("src/lib/antigravity.ts");
  const pool = createParticlePool(800, 600);
  const originals = [...pool];
  const y = pool[0].y;
  advanceParticles(pool, 120, 800, 600);
  assert.ok(Math.abs(pool[0].y - (y - pool[0].speed * 0.05)) < 1e-8);
  pool[0].y = -40;
  advanceParticles(pool, 0.016, 800, 600);
  assert.equal(pool[0].y, 632);
  for (let frame = 0; frame < 20000; frame++) advanceParticles(pool, 1 / 60, 800, 600);
  assert.equal(pool.length, originals.length);
  pool.forEach((particle, index) => {
    assert.equal(particle, originals[index]);
    assert.ok(particle.y >= -32 && particle.y <= 632);
  });
});

test("animation pauses on visibility and preference changes without duplicate loops", () => {
  const env = mountBackground();
  assert.equal(env.element.props["aria-hidden"], "true");
  assert.equal(env.canvas.width, 2000);
  env.tick(100);
  env.tick(116);
  env.document.hidden = true;
  env.document.emit("visibilitychange");
  assert.equal(env.frames.size, 0);
  env.document.hidden = false;
  env.document.emit("visibilitychange");
  env.document.emit("visibilitychange");
  assert.equal(env.frames.size, 1);
  env.tick(120000);
  env.motion.matches = true;
  env.motion.emit("change");
  assert.equal(env.frames.size, 0);
  env.motion.matches = false;
  env.motion.emit("change");
  assert.equal(env.frames.size, 1);
  env.cleanup();
  assert.equal(env.frames.size, 0);
  for (const target of [env.window, env.document, env.motion, env.pointer]) assert.equal(target.count(), 0);
});

test("paused and reduced-motion mounts render a static canvas", () => {
  for (const options of [{ paused: true }, { reduced: true }]) {
    const env = mountBackground(options);
    assert.equal(env.frames.size, 0);
    assert.ok(env.arcs.length > 0);
    env.window.scrollY = 1000;
    env.window.emit("scroll");
    env.window.emit("pointermove", { pointerType: "mouse", clientX: 450, clientY: 320 });
    assert.equal(env.frames.size, 0);
    env.cleanup();
  }
});

test("pause and resume preserve the particle pool instead of recreating the scene", () => {
  const env = mountBackground();
  env.tick(100);
  env.tick(116);
  const before = env.arcs.map(arc => ({ ...arc }));
  env.setPreference({ paused: true, reduced: false });
  assert.equal(env.frames.size, 0);
  assert.deepEqual(env.arcs, before);
  env.setPreference({ paused: false, reduced: false });
  assert.equal(env.frames.size, 1);
  env.tick(120000);
  assert.deepEqual(env.arcs, before);
  env.cleanup();
});

test("touch input and coarse pointers do not interact; desktop repulsion stays subtle", () => {
  for (const options of [{ fine: false, pointerType: "mouse" }, { fine: true, pointerType: "touch" }, { fine: true, pointerType: "mouse" }]) {
    const env = mountBackground(options);
    const control = mountBackground(options);
    env.tick(100);
    control.tick(100);
    const before = { ...env.arcs[0] };
    env.window.emit("pointermove", { pointerType: options.pointerType, clientX: before.x - 20, clientY: before.y });
    env.tick(150);
    control.tick(150);
    const shift = Math.hypot(env.arcs[0].x - control.arcs[0].x, env.arcs[0].y - control.arcs[0].y);
    if (options.fine && options.pointerType === "mouse") {
      assert.ok(shift > 0 && shift < 9);
      assert.equal(env.lights.length, 1);
      env.document.emit("pointerleave");
      env.tick(200);
      control.tick(200);
      const returning = Math.hypot(env.arcs[0].x - control.arcs[0].x, env.arcs[0].y - control.arcs[0].y);
      assert.ok(returning > 0 && returning < shift, "Particles ease back rather than snapping");
    } else {
      assert.equal(shift, 0);
      assert.equal(env.lights.length, 0);
    }
    env.cleanup();
    control.cleanup();
  }
});

test("resizing keeps a single loop and caps large-screen canvas memory", () => {
  const env = mountBackground();
  env.window.innerWidth = 3840;
  env.window.innerHeight = 2160;
  env.window.emit("resize");
  assert.ok(env.canvas.width * env.canvas.height < 8_010_000);
  assert.equal(env.frames.size, 1);
  env.tick(100);
  assert.equal(env.arcs.length, 90);
  env.cleanup();
  const unavailable = mountBackground({ contextAvailable: false });
  assert.equal(unavailable.frames.size, 0);
  assert.equal(unavailable.window.count(), 0);
});

test("lower-powered devices use a smaller pool even on large displays", () => {
  const env = mountBackground({ width: 3840, height: 2160, hardwareConcurrency: 4 });
  env.tick(100);
  assert.ok(env.arcs.length <= 48, "At most 36 particles and their subtle halos");
  env.cleanup();
});

test("resize keeps existing particle positions rather than randomizing the whole scene", () => {
  let randomValue = 0.2;
  const env = mountBackground({ random: () => randomValue });
  env.tick(100);
  const before = { ...env.arcs[0] };
  randomValue = 0.8;
  env.window.innerWidth = 1200;
  env.window.emit("resize");
  assert.ok(Math.abs(env.arcs[0].x - before.x - 40) < 1e-8);
  assert.equal(env.arcs[0].y, before.y);
  env.cleanup();
});

test("project cards expose only configured source and demo links", () => {
  const { ProjectCard } = loadSource("src/components/projects/ProjectCard.tsx", {
    "next/link": { default: () => null },
    "next/image": { default: () => null },
    "@/components/ui/Badge": { Badge: () => null },
    "@/components/ui/Reveal": { Reveal: () => null },
  });
  const project = {
    slug: "test-case", title: "Test project", shortDescription: "Fixture", technologies: ["React"], categories: ["Software"],
    coverImage: { src: "/fixture.svg", alt: "Test cover" },
  };
  function links(element) {
    const result = [];
    function walk(node) {
      if (!node || typeof node !== "object") return;
      if (node.props?.href) result.push(node.props);
      const children = node.props?.children;
      for (const child of Array.isArray(children) ? children : [children]) walk(child);
    }
    walk(element);
    return result;
  }
  const unconfigured = links(ProjectCard({ project }));
  assert.equal(unconfigured.filter(link => link.target === "_blank").length, 0);
  const configured = links(ProjectCard({ project: { ...project, githubUrl: "https://github.com/example/project", liveUrl: "https://example.com" } }));
  const external = configured.filter(link => link.target === "_blank");
  assert.equal(external.length, 2);
  for (const link of external) {
    assert.equal(link.rel, "noopener noreferrer");
    assert.ok(link["aria-label"].includes(project.title));
  }
});

test("scroll parallax moves only decorative particles and remains bounded", () => {
  const env = mountBackground();
  env.tick(100);
  const before = env.arcs[0].y;
  env.window.scrollY = 100000;
  env.window.emit("scroll");
  env.tick(150);
  const shift = before - env.arcs[0].y;
  assert.ok(shift > 0 && shift < 8);
  assert.equal(env.element.props.className, "antigravity-background");
  env.cleanup();
});

test("reveals enhance before paint, accept tall intersections, and stay visible without observation", () => {
  for (const mode of ["normal", "reduced", "no-observer"]) {
    const classes = new Set();
    const el = { ...events(), classList: { add: value => classes.add(value), remove: value => classes.delete(value) } };
    const media = { ...events(), matches: mode === "reduced" };
    let effect, callback, options, disconnected = false;
    class Observer {
      constructor(cb, config) { callback = cb; options = config; }
      observe() {}
      disconnect() { disconnected = true; }
    }
    const window = { matchMedia: () => media, setTimeout: () => 1, clearTimeout() {}, ...(mode !== "no-observer" ? { IntersectionObserver: Observer } : {}) };
    const { Reveal } = loadSource("src/components/ui/Reveal.tsx", {
      react: { useRef: initial => ({ current: initial === null ? el : initial }), useLayoutEffect: cb => { effect = cb; } },
      "@/components/ui/MotionPreference": { useMotionPreference: () => ({ paused: false, reduced: false }) },
    }, { window, document: { documentElement: { dataset: {} } }, IntersectionObserver: Observer });
    const element = Reveal({ children: "Content" });
    assert.equal(element.props.className, "reveal");
    const cleanup = effect();
    if (mode === "normal") {
      assert.ok(classes.has("is-pending"));
      assert.equal(options.threshold, 0.1);
      assert.equal(options.rootMargin, "0px 0px -8% 0px");
      callback([{ isIntersecting: true, intersectionRatio: 0.001 }]);
      assert.ok(classes.has("is-visible"));
      assert.ok(!classes.has("is-pending"));
      el.emit("animationend", { target: el, animationName: "fade-up" });
      assert.ok(classes.has("is-revealed"));
      assert.ok(!classes.has("is-visible"));
      assert.ok(disconnected);
      cleanup();
      assert.equal(media.count(), 0);
      assert.equal(el.count(), 0);
    } else {
      assert.ok(classes.has("is-revealed"));
      assert.ok(!classes.has("is-pending"));
    }
  }
});

test("mobile navigation dismisses on Escape, outside interaction, focus exit and desktop resize", () => {
  const document = events();
  const window = { ...events(), scrollY: 0, cancelAnimationFrame() {} };
  const desktop = { ...events(), matches: false };
  const effects = [];
  const updates = [];
  let focused = false;
  class Node {}
  const inside = new Node();
  const refs = [{ current: { focus: () => { focused = true; } } }, { current: { dataset: {}, matches: () => false, contains: target => target === inside } }];
  const { Navbar } = loadSource("src/components/layout/Navbar.tsx", {
    react: {
      useState: () => [true, value => updates.push(value)],
      useRef: () => refs.shift(),
      useEffect: effect => effects.push(effect),
    },
    "next/link": { default: () => null },
    "next/navigation": { usePathname: () => "/projects/gabay-ai" },
    "@/components/layout/Container": { Container: () => null },
    "@/components/layout/Brand": { Brand: () => null },
  }, { window: Object.assign(window, { matchMedia: () => desktop }), document, Node, process });
  const header = Navbar();
  const cleanups = effects.map(effect => effect());
  const mobile = header.props.children[1];
  assert.equal(mobile.props.hidden, false);
  assert.equal(mobile.props.children.find(link => link.props.href === "/projects").props["aria-current"], "page");
  document.emit("keydown", { key: "Escape" });
  assert.equal(updates.pop(), false);
  window.emit("popstate");
  assert.equal(updates.pop(), false);
  assert.ok(focused);
  document.emit("pointerdown", { target: inside });
  assert.equal(updates.length, 0);
  document.emit("pointerdown", { target: new Node() });
  assert.equal(updates.pop(), false);
  header.props.onBlur({ currentTarget: { dataset: {}, contains: () => false }, relatedTarget: new Node() });
  assert.equal(updates.pop(), false);
  desktop.matches = true;
  desktop.emit("change");
  assert.equal(updates.pop(), false);
  for (const link of mobile.props.children) {
    link.props.onClick();
    assert.equal(updates.pop(), false);
  }
  cleanups.forEach(cleanup => cleanup());
  assert.equal(document.count(), 0);
  assert.equal(desktop.count(), 0);
  assert.equal(window.count(), 0);
});

test("active navigation matches route boundaries rather than unrelated prefixes", () => {
  for (const [pathname, expected] of [["/projects/gabay-ai", "Projects"], ["/projects-extra", undefined], ["/", "Home"]]) {
    const { Navbar } = loadSource("src/components/layout/Navbar.tsx", {
      react: { useState: () => [false, () => {}], useRef: () => ({ current: null }), useEffect() {} },
      "next/link": { default: () => null },
      "next/navigation": { usePathname: () => pathname },
      "@/components/layout/Container": { Container: () => null },
      "@/components/layout/Brand": { Brand: () => null },
    }, { process });
    const mobile = Navbar().props.children[1];
    const active = mobile.props.children.filter(link => link.props["aria-current"] === "page");
    assert.equal(active.length, expected ? 1 : 0);
    if (expected) assert.equal(active[0].props.children[0], expected);
  }
});

test("network connections are bounded and finite without growing the particle pool", () => {
  const env = mountBackground();
  env.tick(100);
  assert.ok(env.edges.length > 0);
  assert.ok(env.edges.length <= 68 * 2);
  for (const edge of env.edges) assert.ok(Number.isFinite(edge.x) && Number.isFinite(edge.y));
  for (let i = 0; i < 100; i++) env.tick(116 + i * 16);
  assert.ok(env.edges.length <= 68 * 2);
  env.cleanup();
});

test("sphere geometry stays on the unit surface and projects depth without singularities", () => {
  const { sphereLines, projectPoint } = loadSource("src/lib/sphere.ts");
  for (const segments of [32, 48]) {
    const lines = sphereLines(segments);
    assert.equal(lines.length, 17);
    for (const line of lines) {
      assert.equal(line.length, segments + 1);
      for (const point of line) {
        assert.ok(Math.abs(Math.hypot(...point) - 1) < 1e-10);
        for (const yaw of [0, Math.PI / 2, Math.PI]) {
          const result = projectPoint(point, yaw, -.28, 100);
          assert.ok(Number.isFinite(result.x) && Number.isFinite(result.y));
          assert.ok(Math.abs(result.x) < 140 && Math.abs(result.y) < 140);
        }
      }
    }
  }
  assert.ok(projectPoint([1, 0, .5], 0, 0, 100).x > projectPoint([1, 0, -.5], 0, 0, 100).x);
  const buffer = { x: 0, y: 0, z: 0 };
  assert.equal(projectPoint([1, 0, 0], .5, -.2, 100, buffer), buffer);
  assert.ok(Number.isFinite(buffer.x) && Number.isFinite(buffer.y));
});

test("sphere keeps one loop, pauses offscreen/hidden/reduced, and cleans up observers", () => {
  const window = { ...events(), innerWidth: 1200, devicePixelRatio: 3, matchMedia: () => ({ matches: true }) };
  const document = { ...events(), hidden: false };
  const context = {
    clearRect() {}, setTransform() {}, beginPath() {}, fill() {}, stroke() {},
    arc() {}, ellipse() {}, save() {}, restore() {}, translate() {}, rotate() {},
    moveTo() {}, lineTo() {}, createRadialGradient: () => ({ addColorStop() {} }),
  };
  const canvas = { ...events(), dataset: {}, getContext: () => context, getBoundingClientRect: () => ({ left: 0, top: 0, width: 310 }) };
  const frames = new Map();
  const refs = [];
  let index = 0, id = 0, effects = [], intersection, disconnected = 0;
  let preference = { paused: false, reduced: false };
  class ResizeObserver { observe() {} disconnect() { disconnected++; } }
  class IntersectionObserver { constructor(callback) { intersection = callback; } observe() {} disconnect() { disconnected++; } }
  const { MathematicalSphere } = loadSource("src/components/home/MathematicalSphere.tsx", {
    react: {
      useRef(initial) { const i = index++; return refs[i] ??= { current: i === 0 ? canvas : initial }; },
      useEffect(callback) { effects.push(callback); },
    },
    "@/components/ui/MotionPreference": { useMotionPreference: () => preference },
  }, { window, document, navigator: { hardwareConcurrency: 8 }, ResizeObserver, IntersectionObserver,
    requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  MathematicalSphere();
  const cleanups = effects.map(effect => effect());
  assert.equal(canvas.dataset.ready, "true");
  assert.equal(canvas.width, 620);
  assert.equal(frames.size, 1);
  intersection([{ isIntersecting: false }]);
  assert.equal(frames.size, 0);
  intersection([{ isIntersecting: true }]);
  assert.equal(frames.size, 1);
  document.hidden = true; document.emit("visibilitychange");
  assert.equal(frames.size, 0);
  document.hidden = false; document.emit("visibilitychange");
  assert.equal(frames.size, 1);
  preference = { paused: false, reduced: true };
  index = 0; effects = []; MathematicalSphere(); effects[0]();
  assert.equal(frames.size, 0);
  preference = { paused: false, reduced: false };
  index = 0; effects = []; MathematicalSphere(); effects[0]();
  assert.equal(frames.size, 1);
  cleanups.forEach(cleanup => cleanup?.());
  assert.equal(frames.size, 0);
  assert.equal(canvas.dataset.ready, undefined);
  assert.equal(disconnected, 2);
  for (const target of [window, document, canvas]) assert.equal(target.count(), 0);
});

test("page exits preserve modified clicks and cancel delayed navigation on history", () => {
  const timers = new Map(), pushes = [], animations = [];
  let id = 0;
  const window = { ...events(), location: new URL("https://portfolio.test/"),
    setTimeout(callback) { timers.set(++id, callback); return id; }, clearTimeout(id) { timers.delete(id); },
  };
  const document = { ...events(), getElementById: () => null };
  const element = { animate() { const animation = { canceled: false, cancel() { this.canceled = true; } }; animations.push(animation); return animation; } };
  const effects = [];
  let index = 0, prevented = 0;
  class Element { constructor(href) { this.href = href; } closest() { return this; } hasAttribute() { return false; } }
  const { PageTransition } = loadSource("src/components/ui/PageTransition.tsx", {
    react: { useRef(initial) { return { current: index++ === 0 ? element : initial }; },
      useEffect(callback) { effects.push(callback); }, useLayoutEffect(callback) { callback(); },
    },
    "next/navigation": { usePathname: () => "/", useRouter: () => ({ push(url) { pushes.push(url); } }) },
    "@/components/ui/MotionPreference": { useMotionPreference: () => ({ paused: false, reduced: false }) },
  }, { window, document, Element, URL });
  PageTransition({ children: "Home" });
  const cleanups = effects.map(effect => effect());
  const click = (href, extra = {}) => document.emit("click", { target: new Element(href), button: 0, preventDefault() { prevented++; }, ...extra });
  click("https://portfolio.test/projects", { ctrlKey: true });
  assert.equal(timers.size, 0);
  click("https://portfolio.test/projects");
  assert.equal(timers.size, 1);
  window.emit("popstate");
  assert.equal(timers.size, 0);
  assert.equal(pushes.length, 0);
  click("https://portfolio.test/projects");
  click("https://portfolio.test/contact?topic=software");
  assert.equal(timers.size, 1, "Rapid navigation keeps only the latest destination");
  const [timer, callback] = timers.entries().next().value;
  timers.delete(timer); callback();
  assert.deepEqual(pushes, ["/contact?topic=software"]);
  assert.equal(prevented, 3);
  cleanups.forEach(cleanup => cleanup?.());
  assert.ok(animations.every(animation => animation.canceled));
  assert.equal(document.count(), 0);
  assert.equal(window.count(), 0);
});

test("animation failures preserve Link navigation and router failures restore content before fallback", () => {
  for (const failure of ["animation", "router"]) {
    const timers = new Map(), fallback = [];
    let id = 0, prevented = 0, canceled = false, refIndex = 0;
    const window = { ...events(), location: Object.assign(new URL("https://portfolio.test/projects"), {
      assign(href) { fallback.push(href); },
    }), setTimeout(cb) { timers.set(++id, cb); return id; }, clearTimeout(timer) { timers.delete(timer); } };
    const document = { ...events(), getElementById: () => null };
    const element = { animate() {
      if (failure === "animation") throw new Error("Animation unavailable");
      return { cancel() { canceled = true; } };
    } };
    class Element { constructor(href) { this.href = href; } closest() { return this; } hasAttribute() { return false; } }
    const effects = [];
    const { PageTransition } = loadSource("src/components/ui/PageTransition.tsx", {
      react: { useRef(initial) { return { current: refIndex++ === 0 ? element : initial }; },
        useEffect(cb) { effects.push(cb); }, useLayoutEffect(cb) { cb(); } },
      "next/navigation": { usePathname: () => "/projects", useRouter: () => ({ push() { throw new Error("Router unavailable"); } }) },
      "@/components/ui/MotionPreference": { useMotionPreference: () => ({ paused: false, reduced: false }) },
    }, { window, document, Element, URL });
    PageTransition({ children: "Projects" });
    const cleanups = effects.map(cb => cb());
    document.emit("click", { target: new Element("https://portfolio.test/projects/gabay-ai"), button: 0, preventDefault() { prevented++; } });
    if (failure === "animation") {
      assert.equal(prevented, 0, "Next Link retains the unprevented click");
      assert.equal(timers.size, 0);
    } else {
      const [timer, callback] = timers.entries().next().value;
      timers.delete(timer); callback();
      assert.equal(prevented, 1);
      assert.equal(canceled, true);
      assert.equal(timers.size, 0);
      assert.deepEqual(fallback, ["https://portfolio.test/projects/gabay-ai"]);
    }
    cleanups.forEach(cb => cb?.());
  }
});

test("headings use one shared fade-up owner and preserve accessible copy and line styling", () => {
  const { RevealText } = loadSource("src/components/ui/RevealText.tsx", {
    "@/components/ui/Reveal": { Reveal: () => null },
  });
  const lines = [{ text: "I build software" }, { text: "that solves" }, { text: "real problems.", className: "silver-text" }];
  const home = RevealText({ lines });
  assert.equal(home.props.as, "h1");
  assert.equal(home.props.className, "reveal-heading");
  assert.equal(home.props.children[0].props.children, "I build software that solves real problems.");
  const lineSpans = home.props.children[1].props.children;
  assert.deepEqual(lineSpans.map(line => line.props.children), ["I build software", "that solves", "real problems."]);
  assert.equal(lineSpans[2].props.className, "reveal-line silver-text");
  assert.equal(home.props.delay, 0);
  const heading = RevealText({ as: "h2", lines: [{ text: "Skills and technologies" }], delay: 80 });
  assert.equal(heading.props.as, "h2");
  assert.equal(heading.props.delay, 80);
  const { motion } = loadSource("src/lib/motion.ts");
  assert.equal(motion.duration, 750);
  assert.equal(motion.headingOffset, "30px");
  assert.equal(motion.blockOffset, "30px");
  assert.equal(motion.mobileHeadingOffset, "30px");
  assert.equal(motion.mobileBlockOffset, "30px");
  assert.equal(motion.easing, "cubic-bezier(.22, 1, .36, 1)");
});

test("reveals wait for intersection and never hide again after pause/resume", () => {
  const classes = new Set(), refs = [];
  const el = { ...events(), classList: { add: value => classes.add(value), remove: value => classes.delete(value) } };
  const media = { ...events(), matches: false };
  let observed = 0, effect, callback, index = 0, preference = { paused: false, reduced: false };
  class Observer {
    constructor(next) { callback = next; }
    observe() { observed++; }
    disconnect() {}
  }
  const { Reveal } = loadSource("src/components/ui/Reveal.tsx", {
    react: {
      useRef(initial) { const i = index++; return refs[i] ??= { current: initial === null ? el : initial }; },
      useLayoutEffect(next) { effect = next; },
    },
    "@/components/ui/MotionPreference": { useMotionPreference: () => preference },
  }, { window: { matchMedia: () => media, IntersectionObserver: Observer, setTimeout: () => 1, clearTimeout() {} }, document: { documentElement: { dataset: {} } }, IntersectionObserver: Observer });
  Reveal({ children: "Card", delay: 80 });
  const cleanup = effect();
  callback([{ isIntersecting: false }]);
  assert.ok(classes.has("is-pending"));
  callback([{ isIntersecting: true }]);
  assert.ok(classes.has("is-visible"));
  cleanup(); preference = { paused: true, reduced: false }; index = 0;
  Reveal({ children: "Card" }); effect();
  assert.ok(classes.has("is-revealed"));
  assert.ok(!classes.has("is-visible"));
  preference = { paused: false, reduced: false }; index = 0;
  Reveal({ children: "Card" }); effect();
  assert.equal(observed, 1, "Revealed content must not be observed or hidden again");
  assert.ok(!classes.has("is-pending"));
  assert.equal(media.count(), 0);
});

test("route commits cancel exits, reset scroll before paint, restore focus, and reset only page reveal owners", () => {
  const timers = new Map(), refs = [], animations = [], pushes = [], scrolls = [];
  let id = 0, index = 0, pathname = "/", effects = [], layouts = [], focused = 0;
  const window = { ...events(), location: new URL("https://portfolio.test/"),
    setTimeout(callback) { timers.set(++id, callback); return id; }, clearTimeout(id) { timers.delete(id); },
    scrollTo(options) { scrolls.push({ ...options }); },
  };
  const document = { ...events(), getElementById: () => ({ focus(options) { assert.equal(options.preventScroll, true); focused++; } }) };
  const element = { animate(keyframes, options) {
    assert.ok(!keyframes.some(frame => "filter" in frame), "Page exits must avoid expensive blur filters");
    assert.equal(options.duration, 240);
    const animation = { canceled: false, cancel() { this.canceled = true; } }; animations.push(animation); return animation;
  } };
  class Element { constructor(href) { this.href = href; } closest() { return this; } hasAttribute() { return false; } }
  const { PageTransition } = loadSource("src/components/ui/PageTransition.tsx", {
    react: {
      useRef(initial) { const i = index++; return refs[i] ??= { current: i === 0 ? element : initial }; },
      useEffect(callback) { effects.push(callback); }, useLayoutEffect(callback) { layouts.push(callback); },
    },
    "next/navigation": { usePathname: () => pathname, useRouter: () => ({ push(url, options) { assert.equal(options.scroll, true); pushes.push(url); } }) },
    "@/components/ui/MotionPreference": { useMotionPreference: () => ({ paused: false, reduced: false }) },
  }, { window, document, Element, URL });
  const page = PageTransition({ children: "Home" });
  layouts.forEach(effect => effect());
  const cleanups = effects.map(effect => effect());
  assert.equal(page.props.children.key, "/");
  assert.equal(animations.length, 0, "PageTransition must not double-animate entrances");
  document.emit("click", { target: new Element("https://portfolio.test/about"), button: 0, preventDefault() {} });
  const [timer, callback] = timers.entries().next().value;
  timers.delete(timer); callback();
  assert.deepEqual(pushes, ["/about"]);
  pathname = "/about"; index = 0; effects = []; layouts = [];
  const about = PageTransition({ children: "About" }); layouts.forEach(effect => effect());
  assert.equal(about.props.children.key, "/about");
  assert.ok(animations[0].canceled);
  assert.equal(timers.size, 0);
  assert.equal(focused, 1);
  assert.deepEqual(scrolls, [{ top: 0, left: 0, behavior: "instant" }]);
  cleanups.forEach(cleanup => cleanup?.());
  assert.equal(window.count(), 0);
  assert.equal(document.count(), 0);
});

test("sphere keeps a static SVG when observation APIs are unavailable", () => {
  const effects = [];
  let index = 0;
  const canvas = { dataset: {}, getContext: () => ({}) };
  const { MathematicalSphere } = loadSource("src/components/home/MathematicalSphere.tsx", {
    react: { useRef(initial) { return { current: index++ === 0 ? canvas : initial }; }, useEffect(callback) { effects.push(callback); } },
    "@/components/ui/MotionPreference": { useMotionPreference: () => ({ paused: false, reduced: false }) },
  });
  const element = MathematicalSphere();
  effects.forEach(effect => effect());
  assert.equal(canvas.dataset.ready, undefined);
  assert.equal(element.props.children[1].type, "svg");
  assert.equal(element.props.children.length, 2, "Sphere must not contain decorative text overlays");
});

test("navbar batches passive scroll updates, restores on history, and avoids boundary jitter", () => {
  const frames = new Map(), dataset = {}, stateUpdates = [];
  let frameId = 0, scrollOptions;
  const window = { ...events(), scrollY: 240,
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); },
    matchMedia: () => ({ ...events(), matches: false }),
  };
  const add = window.addEventListener;
  window.addEventListener = (name, callback, options) => { if (name === "scroll") scrollOptions = options; add(name, callback); };
  const refs = [{ current: null }, { current: { dataset, matches: () => false } }], effects = [];
  const { Navbar } = loadSource("src/components/layout/Navbar.tsx", {
    react: { useState: () => [false, value => stateUpdates.push(value)], useRef: () => refs.shift(), useEffect: callback => effects.push(callback) },
    "next/link": { default: () => null }, "next/navigation": { usePathname: () => "/about" },
    "@/components/layout/Container": { Container: () => null }, "@/components/layout/Brand": { Brand: () => null },
  }, { window, process });
  const header = Navbar(), cleanups = effects.map(effect => effect());
  assert.equal(header.props["data-menu-open"], false);
  assert.equal(dataset.scrolled, "true", "Restored scroll positions compact immediately");
  assert.equal(scrollOptions.passive, true);
  const scroll = y => {
    window.scrollY = y;
    window.emit("scroll"); window.emit("scroll");
    assert.equal(frames.size, 1, "Scroll bursts use one frame");
    const [id, callback] = frames.entries().next().value; frames.delete(id); callback();
  };
  scroll(90); assert.equal(dataset.scrolled, "true");
  scroll(80); assert.equal(dataset.scrolled, "false");
  scroll(95); assert.equal(dataset.scrolled, "false");
  scroll(101); assert.equal(dataset.scrolled, "true");
  window.scrollY = 0; window.emit("pageshow");
  assert.equal(dataset.scrolled, "false");
  assert.equal(stateUpdates.length, 0, "Scrolling does not rerender navigation");
  window.emit("scroll"); cleanups.forEach(cleanup => cleanup?.());
  assert.equal(frames.size, 0); assert.equal(window.count(), 0);
});

test("reveal bootstrap fails open on slow hydration and skips reduced motion", () => {
  const { revealBootstrap } = loadSource("src/lib/reveal-bootstrap.ts");
  for (const reduced of [false, true]) {
    const dataset = {}, timers = [];
    vm.runInNewContext(revealBootstrap, {
      document: { documentElement: { dataset } },
      window: { location: { pathname: "/about" }, matchMedia: () => ({ matches: reduced }), setTimeout: cb => timers.push(cb) },
    });
    if (reduced) { assert.equal(dataset.revealState, undefined); assert.equal(timers.length, 0); }
    else {
      assert.equal(dataset.revealState, "booting"); assert.equal(dataset.revealPath, "/about");
      timers[0](); assert.equal(dataset.revealState, "expired");
      dataset.revealState = "ready"; timers[0](); assert.equal(dataset.revealState, "ready");
    }
  }
});

test("reveals recover from failed observers and release keyboard targets immediately", () => {
  for (const mode of ["constructor-error", "observe-error", "silent", "focus", "expired", "next-route"]) {
    const classes = new Set(), timers = new Map();
    const el = { ...events(), classList: { add: value => classes.add(value), remove: value => classes.delete(value) } };
    const dataset = mode === "expired" || mode === "next-route" ? { revealState: "expired", revealPath: "/about" } : {};
    let effect, id = 0, disconnected = false;
    class Observer {
      constructor() { if (mode === "constructor-error") throw new Error("Unavailable observer"); }
      observe() { if (mode === "observe-error") throw new Error("Observation failed"); }
      disconnect() { disconnected = true; }
    }
    const window = {
      location: { pathname: mode === "next-route" ? "/projects" : "/about" },
      matchMedia: () => ({ matches: false }), IntersectionObserver: Observer,
      setTimeout(cb) { timers.set(++id, cb); return id; }, clearTimeout(id) { timers.delete(id); },
    };
    const { Reveal } = loadSource("src/components/ui/Reveal.tsx", {
      react: { useRef: initial => ({ current: initial === null ? el : initial }), useLayoutEffect: cb => { effect = cb; } },
      "@/components/ui/MotionPreference": { useMotionPreference: () => ({ paused: false, reduced: false }) },
    }, { window, document: { documentElement: { dataset } }, IntersectionObserver: Observer });
    Reveal({ children: "Focusable content" }); const cleanup = effect();
    if (["silent", "focus", "next-route"].includes(mode)) {
      assert.ok(classes.has("is-pending"));
      if (mode === "silent") [...timers.values()][0](); else el.emit("focusin");
      assert.ok(disconnected);
    }
    assert.ok(classes.has("is-revealed")); assert.ok(!classes.has("is-pending"));
    cleanup?.(); assert.equal(timers.size, 0); assert.equal(el.count(), 0);
  }
});

test("all destination routes and history commits start at zero without disturbing local updates or hash links", () => {
  for (const reduced of [false, true]) {
    const refs = [], layouts = [], scrolls = [];
    let index = 0, pathname = "/";
    const window = { location: new URL("https://portfolio.test/"), clearTimeout() {}, scrollTo(options) { scrolls.push({ ...options }); } };
    const { PageTransition } = loadSource("src/components/ui/PageTransition.tsx", {
      react: { useRef(initial) { return refs[index++] ??= { current: initial }; }, useEffect() {}, useLayoutEffect(cb) { layouts.push(cb); } },
      "next/navigation": { usePathname: () => pathname, useRouter: () => ({}) },
      "@/components/ui/MotionPreference": { useMotionPreference: () => ({ paused: reduced, reduced }) },
    }, { window, document: { getElementById: () => ({ focus() {} }) } });
    const commit = next => {
      pathname = next; window.location = new URL(next, "https://portfolio.test"); index = 0; layouts.length = 0;
      PageTransition({ children: next }); layouts.forEach(cb => cb());
    };
    commit("/"); assert.equal(scrolls.length, 0, "Initial visits retain browser-managed positioning");
    const paths = ["/projects", "/about", "/contact", "/projects/gabay-ai", "/projects/discord-lms", "/projects/dangalspot", "/projects/mathdyl-tutorial", "/", "/about", "/", "/about"];
    for (const next of paths) {
      const before = scrolls.length; commit(next);
      assert.equal(scrolls.length, before + 1, next);
      assert.deepEqual(scrolls.at(-1), { top: 0, left: 0, behavior: "instant" });
      commit(next); assert.equal(scrolls.length, before + 1, "Small updates must not jump to top");
    }
    const before = scrolls.length;
    pathname = "/projects"; window.location = new URL("https://portfolio.test/projects#selected-work"); index = 0; layouts.length = 0;
    PageTransition({ children: "Hash destination" }); layouts.forEach(cb => cb());
    assert.equal(scrolls.length, before, "Cross-page hash links keep anchor behavior");
  }
});

test("same-page clicks return to top and cancel pending exits while preserving anchors and modified clicks", () => {
  for (const reduced of [false, true]) {
    const timers = new Map(), scrolls = [], effects = [];
    let id = 0, index = 0, prevented = 0;
    const window = { ...events(), location: new URL("https://portfolio.test/projects"),
      setTimeout(cb) { timers.set(++id, cb); return id; }, clearTimeout(id) { timers.delete(id); }, scrollTo(options) { scrolls.push({ ...options }); },
    };
    const document = { ...events() };
    class Element { constructor(href) { this.href = href; } closest() { return this; } hasAttribute() { return false; } }
    const el = { animate: () => ({ cancel() {} }) };
    const { PageTransition } = loadSource("src/components/ui/PageTransition.tsx", {
      react: { useRef(initial) { return { current: index++ === 0 ? el : initial }; }, useLayoutEffect() {}, useEffect(cb) { effects.push(cb); } },
      "next/navigation": { usePathname: () => "/projects", useRouter: () => ({ push() {} }) },
      "@/components/ui/MotionPreference": { useMotionPreference: () => ({ paused: reduced, reduced }) },
    }, { window, document, Element, URL });
    PageTransition({ children: "Projects" }); const cleanups = effects.map(cb => cb());
    const click = (href, extra = {}) => document.emit("click", { target: new Element(href), button: 0, preventDefault() { prevented++; }, ...extra });
    click("https://portfolio.test/about");
    assert.equal(timers.size, reduced ? 0 : 1);
    click("https://portfolio.test/projects");
    assert.equal(timers.size, 0, "Returning to the current page cancels the prior destination");
    assert.deepEqual(scrolls, [{ top: 0, left: 0, behavior: "instant" }]);
    click("https://portfolio.test/projects#top");
    click("https://portfolio.test/projects", { metaKey: true });
    click("https://portfolio.test/projects", { button: 1 });
    click("https://external.test/projects");
    click("https://portfolio.test/projects?category=AI");
    assert.equal(scrolls.length, 1);
    assert.equal(prevented, reduced ? 0 : 1);
    cleanups.forEach(cb => cb()); assert.equal(document.count(), 0); assert.equal(window.count(), 0);
  }
});

test("navbar retains accessible labels, matching vector icons, tooltips, active state and scroll intent", () => {
  const icons = runtimeRequire("lucide-react");
  const expectedIcons = { "/": icons.Home, "/projects": icons.FolderCode, "/about": icons.UserRound, "/contact": icons.Mail };
  const { Navbar } = loadSource("src/components/layout/Navbar.tsx", {
    react: { useState: () => [false, () => {}], useRef: () => ({ current: null }), useEffect() {} },
    "next/link": { default: () => null }, "next/navigation": { usePathname: () => "/projects/gabay-ai" },
    "@/components/layout/Container": { Container: () => null }, "@/components/layout/Brand": { Brand: () => null },
  }, { process });
  const header = Navbar(), [surface, mobile] = header.props.children;
  const [brand, navigation] = surface.props.children;
  assert.equal(brand.props.href, "/"); assert.equal(brand.props.scroll, true); assert.equal(brand.props["aria-label"], "Mathdyl home");
  assert.equal(navigation.props.children.length, 4);
  for (const link of navigation.props.children) {
    const [icon, label, tooltip] = link.props.children;
    assert.equal(icon.type, expectedIcons[link.props.href]); assert.equal(icon.props["aria-hidden"], "true");
    assert.equal(link.props["aria-label"], label.props.children);
    assert.equal(tooltip.props.children, label.props.children); assert.equal(tooltip.props.className, "nav-tooltip");
    assert.equal(link.props.scroll, true);
    assert.equal(link.props["aria-current"], link.props.href === "/projects" ? "page" : undefined);
  }
  for (const link of mobile.props.children) assert.equal(link.props.scroll, true);
  const { Brand } = loadSource("src/components/layout/Brand.tsx", {}, { process });
  assert.equal(Brand().props.children[0].props.children, "M");
});

test("navbar hands icon tooltips over to expanded labels and ignores nested transitions", () => {
  let hover = true, focused = false;
  const dataset = { scrolled: "true", expanded: "false" };
  const currentTarget = { dataset, matches: () => hover || focused };
  class Element { constructor(surface) { this.classList = { contains: name => surface && name === "nav-container" }; } }
  const { Navbar } = loadSource("src/components/layout/Navbar.tsx", {
    react: { useState: () => [false, () => {}], useRef: () => ({ current: null }), useEffect() {} },
    "next/link": { default: () => null }, "next/navigation": { usePathname: () => "/" },
    "@/components/layout/Container": { Container: () => null }, "@/components/layout/Brand": { Brand: () => null },
  }, { Element, process });
  const header = Navbar();
  header.props.onTransitionEnd({ currentTarget, target: new Element(false), propertyName: "width" });
  assert.equal(dataset.expanded, "false");
  header.props.onTransitionEnd({ currentTarget, target: new Element(true), propertyName: "opacity" });
  assert.equal(dataset.expanded, "false");
  header.props.onTransitionEnd({ currentTarget, target: new Element(true), propertyName: "width" });
  assert.equal(dataset.expanded, "true");
  hover = false; focused = true; header.props.onPointerLeave({ currentTarget }); assert.equal(dataset.expanded, "true");
  focused = false; header.props.onPointerLeave({ currentTarget }); assert.equal(dataset.expanded, "false");
});
