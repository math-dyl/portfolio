"use client";

import { useEffect, useRef } from "react";
import { useMotionPreference } from "@/components/ui/MotionPreference";
import { projectPoint, sphereLines } from "@/lib/sphere";

export function MathematicalSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { paused, reduced } = useMotionPreference();
  const preference = useRef({ paused, reduced });
  const syncRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    preference.current = { paused, reduced };
    syncRef.current?.();
  }, [paused, reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    if (typeof ResizeObserver === "undefined" || typeof IntersectionObserver === "undefined") return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const lowPower = window.innerWidth < 768 || navigator.hardwareConcurrency <= 4;
    const lines = sphereLines(lowPower ? 32 : 48);
    const projected = lines.map(line => line.map(() => ({ x: 0, y: 0, z: 0 })));
    let size = 1, frame = 0, last = 0, elapsed = 0;
    let inView = true, pointerActive = false;
    let targetX = 0, targetY = 0, shiftX = 0, shiftY = 0;
    const canAnimate = () => inView && !document.hidden && !preference.current.paused && !preference.current.reduced;

    function draw(delta = 0) {
      if (!context) return;
      const easing = 1 - Math.exp(-delta * 3.5);
      shiftX += ((pointerActive ? targetX : 0) - shiftX) * easing;
      shiftY += ((pointerActive ? targetY : 0) - shiftY) * easing;
      context.clearRect(0, 0, size, size);
      const radius = size * .32;
      const cx = size / 2 + shiftX * 6;
      const cy = size / 2 + Math.sin(elapsed * .45) * 3;
      const yaw = elapsed * .11 + shiftX * .22;
      const tilt = -.28 + shiftY * .18;
      const light = context.createRadialGradient(cx - radius * .4, cy - radius * .5, 0, cx, cy, radius * 1.07);
      light.addColorStop(0, "#202a35");
      light.addColorStop(.6, "#0c1118");
      light.addColorStop(1, "rgba(6,8,12,.2)");
      context.fillStyle = light;
      context.beginPath(); context.arc(cx, cy, radius * 1.037, 0, Math.PI * 2); context.fill();
      context.lineWidth = .7;
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const points = projected[lineIndex];
        for (let index = 0; index < line.length; index++) projectPoint(line[index], yaw, tilt, radius, points[index]);
        // Separate rear/front grid strokes give the surface actual depth.
        for (const front of [false, true]) {
          context.strokeStyle = front ? "rgba(211,226,242,.4)" : "rgba(126,148,175,.09)";
          context.beginPath();
          for (let i = 1; i < points.length; i++) {
            const a = points[i - 1], b = points[i];
            if ((a.z + b.z >= 0) !== front) continue;
            context.moveTo(cx + a.x, cy + a.y); context.lineTo(cx + b.x, cy + b.y);
          }
          context.stroke();
        }
      }
      context.strokeStyle = "rgba(188,208,234,.2)";
      context.beginPath(); context.arc(cx, cy, radius * 1.037, 0, Math.PI * 2); context.stroke();
      for (let orbit = 0; orbit < 2; orbit++) {
        context.save(); context.translate(cx, cy); context.rotate(-.4 + orbit * .9);
        context.strokeStyle = "rgba(168,193,225,.2)";
        context.beginPath(); context.ellipse(0, 0, radius * 1.4, radius * .42, 0, 0, Math.PI * 2); context.stroke();
        const angle = elapsed * (orbit ? -.16 : .2) + orbit * Math.PI;
        context.fillStyle = "#cfdfef";
        context.beginPath(); context.arc(Math.cos(angle) * radius * 1.4, Math.sin(angle) * radius * .42, 2, 0, Math.PI * 2); context.fill();
        context.restore();
      }
    }
    function tick(time: number) {
      frame = 0;
      if (!canAnimate()) return;
      if (!last || time - last >= (lowPower ? 32 : 15)) {
        const delta = last ? Math.min((time - last) / 1000, .05) : 0;
        last = time; elapsed += delta; draw(delta);
      }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (canAnimate()) frame = requestAnimationFrame(tick);
      else draw();
    }
    function resize() {
      if (!canvas || !context) return;
      size = Math.max(1, canvas.getBoundingClientRect().width);
      const ratio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
      canvas.width = Math.round(size * ratio); canvas.height = Math.round(size * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0); draw();
    }
    function onPointer(event: PointerEvent) {
      if (!canAnimate() || !finePointer.matches || event.pointerType !== "mouse") return;
      const bounds = canvas!.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      pointerActive = true;
    }
    const clearPointer = () => { pointerActive = false; };
    const resizeObserver = new ResizeObserver(resize);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    resizeObserver.observe(canvas); observer.observe(canvas);
    canvas.dataset.ready = "true";
    syncRef.current = sync; resize(); sync();
    canvas.addEventListener("pointermove", onPointer, { passive: true });
    canvas.addEventListener("pointerleave", clearPointer);
    window.addEventListener("blur", clearPointer);
    document.addEventListener("visibilitychange", sync);
    return () => {
      syncRef.current = null; cancelAnimationFrame(frame);
      resizeObserver.disconnect(); observer.disconnect();
      canvas.removeEventListener("pointermove", onPointer); canvas.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("blur", clearPointer); document.removeEventListener("visibilitychange", sync);
      delete canvas.dataset.ready;
    };
  }, []);

  return <div className="mathematical-sphere" aria-hidden="true">
    <canvas ref={canvasRef} />
    <svg className="sphere-fallback" viewBox="0 0 320 320" fill="none">
      <circle cx="160" cy="160" r="100" fill="#0c1118" stroke="#65778d" />
      {[30, 60, 85].map(radius => <ellipse key={radius} cx="160" cy="160" rx={radius} ry="100" stroke="#65778d" opacity=".5" />)}
      {[30, 60].map(radius => <ellipse key={radius} cx="160" cy="160" rx="100" ry={radius} stroke="#65778d" opacity=".5" />)}
      <ellipse cx="160" cy="160" rx="142" ry="43" stroke="#65778d" transform="rotate(-23 160 160)" />
    </svg>
  </div>;
}
