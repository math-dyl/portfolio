"use client";

import { useEffect, useRef } from "react";
import { advanceParticles, createParticlePool, type Particle } from "@/lib/antigravity";
import { useMotionPreference } from "@/components/ui/MotionPreference";

export function AntigravityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { paused, reduced } = useMotionPreference();
  const preferenceRef = useRef({ paused, reduced });
  const syncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    preferenceRef.current = { paused, reduced };
    syncRef.current?.();
  }, [paused, reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const pointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let positions: { x: number; y: number }[] = [];
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let pointerActive = false;
    let pointerX = 0;
    let pointerY = 0;
    let shiftX = 0;
    let shiftY = 0;
    let scrollShift = 0;
    let lightX = 0;
    let lightY = 0;
    let lightOpacity = 0;
    let scrollTarget = Math.min(window.scrollY, 2400) * 0.012;
    const canAnimate = () => !preferenceRef.current.paused && !preferenceRef.current.reduced && !motionMedia.matches && !document.hidden;

    function draw(delta: number) {
      if (!context) return;
      const easing = 1 - Math.exp(-delta * 4);
      const targetX = pointerActive ? (pointerX / width - 0.5) * 12 : 0;
      const targetY = pointerActive ? (pointerY / height - 0.5) * 10 : 0;
      shiftX += (targetX - shiftX) * easing;
      shiftY += (targetY - shiftY) * easing;
      scrollShift += (scrollTarget - scrollShift) * easing;
      lightX += (pointerX - lightX) * easing;
      lightY += (pointerY - lightY) * easing;
      lightOpacity += ((pointerActive ? 0.045 : 0) - lightOpacity) * easing;
      // The same eased inputs give CSS atmosphere layers a different depth.
      canvas?.parentElement?.style.setProperty("--environment-x", `${shiftX.toFixed(2)}px`);
      canvas?.parentElement?.style.setProperty("--environment-y", `${(shiftY - scrollShift).toFixed(2)}px`);
      context.clearRect(0, 0, width, height);
      if (lightOpacity > 0.001) {
        const light = context.createRadialGradient(lightX, lightY, 0, lightX, lightY, 180);
        light.addColorStop(0, "#8da4c1");
        light.addColorStop(1, "rgba(141,164,193,0)");
        context.globalAlpha = lightOpacity;
        context.fillStyle = light;
        context.fillRect(lightX - 180, lightY - 180, 360, 360);
      }
      context.fillStyle = "#dce3ed";
      for (let index = 0; index < particles.length; index++) {
        const particle = particles[index];
        let x = particle.x + Math.sin(elapsed * 0.22 + particle.phase) * particle.drift + shiftX * particle.depth;
        let y = particle.y + Math.cos(elapsed * 0.18 + particle.phase) * particle.drift * 0.35 + (shiftY - scrollShift) * particle.depth;
        let pushX = 0;
        let pushY = 0;
        if (pointerActive) {
          const dx = x - pointerX;
          const dy = y - pointerY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < 120) {
            const push = (1 - distance / 120) ** 2 * 9 * particle.depth;
            pushX = dx / distance * push;
            pushY = dy / distance * push;
          }
        }
        particle.offsetX += (pushX - particle.offsetX) * easing;
        particle.offsetY += (pushY - particle.offsetY) * easing;
        x += particle.offsetX;
        y += particle.offsetY;
        positions[index].x = x;
        positions[index].y = y;
        if (particle.depth > 0.8) {
          context.globalAlpha = particle.opacity * 0.12;
          context.beginPath();
          context.arc(x, y, particle.radius * 3, 0, Math.PI * 2);
          context.fill();
        }
        context.globalAlpha = particle.opacity;
        context.beginPath();
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      // A sparse, bounded graph shares the existing particle loop and pool.
      context.strokeStyle = "#9cb3d0";
      context.lineWidth = .5;
      const reach = width < 768 ? 110 : 155;
      for (let i = 0; i < positions.length; i++) {
        let edges = 0;
        for (let j = i + 1; j < positions.length && edges < 2; j++) {
          if (particles[i].depth !== particles[j].depth) continue;
          const a = positions[i], b = positions[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > reach) continue;
          context.globalAlpha = (1 - distance / reach) * .09;
          context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
          edges++;
        }
      }
      context.globalAlpha = 1;
    }

    function tick(time: number) {
      frame = 0;
      if (!canAnimate()) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      elapsed += delta;
      advanceParticles(particles, delta, width, height);
      draw(delta);
      frame = requestAnimationFrame(tick);
    }

    function syncAnimation() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      pointerActive = false;
      if (canAnimate()) frame = requestAnimationFrame(tick);
      else {
        if (motionMedia.matches || preferenceRef.current.reduced) {
          shiftX = shiftY = scrollShift = lightOpacity = 0;
          for (const particle of particles) particle.offsetX = particle.offsetY = 0;
        }
        draw(0);
      }
    }

    function resize() {
      if (!canvas || !context) return;
      const previousWidth = width;
      const previousHeight = height;
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(8_000_000 / (width * height)));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const lowPower = typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4;
      const next = createParticlePool(width, height, lowPower || width < 768 ? 36 : 68);
      if (previousWidth && previousHeight) particles.forEach((particle, index) => {
        if (index >= next.length) return;
        particle.x *= width / previousWidth;
        particle.y *= height / previousHeight;
        next[index] = particle;
      });
      particles = next;
      positions = particles.map(() => ({ x: 0, y: 0 }));
      draw(0);
    }

    function onPointer(event: PointerEvent) {
      if (!canAnimate() || width < 768 || !pointerMedia.matches || event.pointerType !== "mouse") return;
      if (!pointerActive) { lightX = event.clientX; lightY = event.clientY; }
      pointerActive = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
    }
    const clearPointer = () => { pointerActive = false; };
    const onScroll = () => { scrollTarget = Math.min(window.scrollY, 2400) * 0.012; };

    syncRef.current = syncAnimation;
    resize();
    syncAnimation();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("blur", clearPointer);
    document.addEventListener("pointerleave", clearPointer);
    document.addEventListener("visibilitychange", syncAnimation);
    motionMedia.addEventListener("change", syncAnimation);
    pointerMedia.addEventListener("change", clearPointer);

    return () => {
      syncRef.current = null;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("blur", clearPointer);
      document.removeEventListener("pointerleave", clearPointer);
      document.removeEventListener("visibilitychange", syncAnimation);
      motionMedia.removeEventListener("change", syncAnimation);
      pointerMedia.removeEventListener("change", clearPointer);
      context.clearRect(0, 0, width, height);
      particles.length = 0;
    };
  }, []);

  return <div className="antigravity-background" aria-hidden="true"><div className="ambient-grid" /><div className="ambient-light" /><canvas ref={canvasRef} /></div>;
}
