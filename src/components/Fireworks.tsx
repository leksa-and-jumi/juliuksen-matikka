import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../audio/sfx';
import { FIREWORK_LAUNCH_EVERY_MS } from '../config';
import { launchRocket, stepParticles, type Particle } from '../logic/fireworks';

/** Longest frame step, so a paused tab does not make everything jump. */
const MAX_DT = 1 / 20;
const TRAIL_FADE = 0.22;
const ROCKET_SIZE = 3.5;
const SPARK_SIZE = 5;

/**
 * Night sky with rockets that shoot up and burst into colourful sparks.
 * Tapping anywhere skips straight to the results.
 */
export function Fireworks({ durationMs }: { durationMs: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (done || !canvas || !ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let particles: Particle[] = [];
    const start = performance.now();
    let last = start;
    let nextLaunch = start;
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min(MAX_DT, (now - last) / 1000);
      last = now;
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (now - start < durationMs && now >= nextLaunch) {
        particles.push(launchRocket(w, h, Math.random));
        // Sometimes two at once for a bigger show.
        if (Math.random() < 0.3) particles.push(launchRocket(w, h, Math.random));
        nextLaunch = now + FIREWORK_LAUNCH_EVERY_MS * (0.6 + Math.random() * 0.8);
      }

      const stepped = stepParticles(particles, dt, Math.random);
      particles = stepped.particles;
      if (stepped.bursts > 0) sfx.boom();

      // Fade the previous frame a little to leave glowing trails.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_FADE})`;
      ctx.fillRect(0, 0, w, h);
      // Additive colours glow on the dark sky.
      ctx.globalCompositeOperation = 'lighter';

      for (const p of particles) {
        const alpha = p.kind === 'spark' ? Math.max(0, p.life / p.maxLife) : 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.kind === 'rocket' ? ROCKET_SIZE : SPARK_SIZE, 0, Math.PI * 2);
        ctx.fill();
        if (p.kind === 'rocket' || alpha > 0.6) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (now - start < durationMs || particles.length > 0) {
        frame = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [durationMs, done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-30 cursor-pointer bg-[#120f2b]/85"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          onClick={() => setDone(true)}
          role="button"
          aria-label="Jatka"
        >
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
          <motion.p
            className="absolute right-0 bottom-6 left-0 text-center text-lg font-semibold text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            👆 Napauta, niin jatketaan
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
