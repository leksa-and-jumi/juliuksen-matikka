import {
  FIREWORK_COLORS,
  FIREWORK_DRAG,
  FIREWORK_GRAVITY,
  FIREWORK_SPARKS,
  FIREWORK_SPARK_LIFE,
  FIREWORK_SPARK_SPEED,
} from '../config';
import type { Rng } from './types';

export interface Particle {
  kind: 'rocket' | 'spark';
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  /** Seconds left (sparks fade out as this runs down). */
  life: number;
  maxLife: number;
  /** Rockets explode at this height. */
  targetY: number;
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)] as T;
}

/** A rocket shoots up from the bottom and explodes high on the screen. */
export function launchRocket(width: number, height: number, rng: Rng): Particle {
  const targetY = height * (0.12 + rng() * 0.33);
  const rise = height - targetY;
  // Speed needed to reach targetY against gravity: v² = 2·g·h.
  const vy = -Math.sqrt(2 * FIREWORK_GRAVITY * rise) * 1.05;
  return {
    kind: 'rocket',
    x: width * (0.12 + rng() * 0.76),
    y: height,
    vx: (rng() - 0.5) * 60,
    vy,
    color: pick(FIREWORK_COLORS, rng),
    life: 10,
    maxLife: 10,
    targetY,
  };
}

/** A rocket bursts into a ring of sparks in one or two colours. */
export function explode(rocket: Particle, rng: Rng, count = FIREWORK_SPARKS): Particle[] {
  const second = pick(FIREWORK_COLORS, rng);
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + rng() * 0.2;
    const speed = FIREWORK_SPARK_SPEED * (0.45 + rng() * 0.55);
    const life = FIREWORK_SPARK_LIFE * (0.7 + rng() * 0.5);
    return {
      kind: 'spark' as const,
      x: rocket.x,
      y: rocket.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: i % 3 === 0 ? second : rocket.color,
      life,
      maxLife: life,
      targetY: 0,
    };
  });
}

/**
 * Moves every particle forward by dt seconds. Rockets that reach their
 * height (or start falling) explode into sparks; burnt-out sparks vanish.
 */
export function stepParticles(
  particles: Particle[],
  dt: number,
  rng: Rng,
): { particles: Particle[]; bursts: number } {
  const next: Particle[] = [];
  let bursts = 0;
  for (const p of particles) {
    const drag = p.kind === 'spark' ? FIREWORK_DRAG : 1;
    const moved: Particle = {
      ...p,
      vx: p.vx * drag,
      vy: p.vy * drag + FIREWORK_GRAVITY * dt,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      life: p.life - dt,
    };
    if (moved.kind === 'rocket' && (moved.y <= moved.targetY || moved.vy >= 0)) {
      next.push(...explode(moved, rng));
      bursts++;
    } else if (moved.life > 0) {
      next.push(moved);
    }
  }
  return { particles: next, bursts };
}
