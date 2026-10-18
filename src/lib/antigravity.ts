export interface Particle {
  x: number;
  y: number;
  depth: number;
  radius: number;
  opacity: number;
  speed: number;
  phase: number;
  drift: number;
  offsetX: number;
  offsetY: number;
}

export function createParticlePool(width: number, height: number, limit = 68): Particle[] {
  const count = Math.min(Math.max(20, limit), 68, Math.max(20, Math.round(width * height / 22000)));
  const depths = [0.25, 0.55, 0.9];
  return Array.from({ length: count }, (_, index) => {
    const depth = depths[index % depths.length];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      depth,
      radius: 0.5 + depth * 1.1,
      opacity: 0.12 + depth * 0.24,
      speed: (4 + depth * 9) * (0.8 + Math.random() * 0.4),
      phase: Math.random() * Math.PI * 2,
      drift: 4 + depth * 8,
      offsetX: 0,
      offsetY: 0,
    };
  });
}

export function advanceParticles(particles: Particle[], delta: number, width: number, height: number) {
  // Bound elapsed time so returning from a suspended tab never causes a jump.
  const seconds = Math.min(0.05, Math.max(0, delta));
  for (const particle of particles) {
    particle.y -= particle.speed * seconds;
    if (particle.y < -32) {
      particle.y = height + 32;
      particle.x = Math.random() * width;
    }
  }
}
