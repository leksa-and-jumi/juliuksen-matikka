import { describe, expect, it } from 'vitest';
import { FIREWORK_SPARKS } from '../config';
import { explode, launchRocket, stepParticles, type Particle } from './fireworks';

const rng = () => 0.5;

function runUntilBurst(rocket: Particle): { steps: number; particles: Particle[] } {
  let particles = [rocket];
  for (let steps = 1; steps < 1000; steps++) {
    const r = stepParticles(particles, 1 / 60, rng);
    particles = r.particles;
    if (r.bursts > 0) return { steps, particles };
  }
  throw new Error('rocket never exploded');
}

describe('fireworks', () => {
  it('launches rockets from the bottom towards the top part of the screen', () => {
    const r = launchRocket(800, 600, rng);
    expect(r.y).toBe(600);
    expect(r.vy).toBeLessThan(0);
    expect(r.targetY).toBeLessThan(600 * 0.5);
  });

  it('a rocket explodes into sparks in under two seconds', () => {
    const { steps, particles } = runUntilBurst(launchRocket(800, 600, rng));
    expect(steps).toBeLessThan(120);
    expect(particles).toHaveLength(FIREWORK_SPARKS);
    expect(particles.every((p) => p.kind === 'spark')).toBe(true);
  });

  it('sparks spread in every direction and burn out', () => {
    const sparks = explode(launchRocket(800, 600, rng), rng);
    expect(sparks.some((s) => s.vx > 0) && sparks.some((s) => s.vx < 0)).toBe(true);
    expect(sparks.some((s) => s.vy > 0) && sparks.some((s) => s.vy < 0)).toBe(true);
    let particles = sparks;
    for (let i = 0; i < 200; i++) particles = stepParticles(particles, 1 / 60, rng).particles;
    expect(particles).toHaveLength(0);
  });
});
