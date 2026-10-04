import { motion } from 'motion/react';
import { useEffect } from 'react';
import { sfx } from '../audio/sfx';
import { COUNT_STAGGER } from '../config';
import { framesFor, framesScene } from '../logic/scenes';
import type { CompareScene, FramesScene, Scene } from '../logic/types';
import { Croc } from './Croc';
import { NumberBond } from './NumberBond';
import { TenFrame, type FrameSize } from './TenFrame';

/** Running count numbers (1, 2, 3…) for red and blue counters across all frames. */
function countLabels(scene: FramesScene): (number | null)[][] {
  let n = 0;
  return scene.frames.map((frame) =>
    frame.map((cell) => (scene.numbered && (cell === 'red' || cell === 'blue') ? ++n : null)),
  );
}

function FramesView({ scene, size }: { scene: FramesScene; size: FrameSize }) {
  const labels = countLabels(scene);
  const total = labels.flat().filter((l) => l !== null).length;

  // Little pop sound for every counted ball.
  useEffect(() => {
    if (total === 0) return;
    const timers = Array.from({ length: total }, (_, i) =>
      window.setTimeout(() => sfx.pop(i), i * COUNT_STAGGER * 1000),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [total]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {scene.frames.map((cells, i) => (
          <TenFrame key={i} cells={cells} size={size} labels={labels[i]} />
        ))}
      </div>
      {scene.bond && <NumberBond bond={scene.bond} />}
    </div>
  );
}

function NumberStack({ value, glow }: { value: number; glow: boolean }) {
  const scene = framesScene(framesFor(value));
  return (
    <motion.div
      className={`flex flex-col items-center gap-2 rounded-3xl border-4 p-2 sm:p-3 ${
        glow ? 'border-ink bg-sun-soft' : 'border-transparent'
      }`}
      animate={glow ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={glow ? { duration: 1.2, repeat: Infinity } : undefined}
    >
      <div className="text-6xl leading-none font-bold sm:text-7xl">{value}</div>
      <div className="flex flex-col gap-1.5">
        {scene.frames.map((cells, i) => (
          <TenFrame key={i} cells={cells} size="sm" />
        ))}
      </div>
    </motion.div>
  );
}

function CompareView({ scene }: { scene: CompareScene }) {
  const glowLeft = scene.glow === 'left' || scene.glow === 'both';
  const glowRight = scene.glow === 'right' || scene.glow === 'both';
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-6">
      <NumberStack value={scene.left} glow={glowLeft} />
      <Croc state={scene.croc} facing={scene.right > scene.left ? 'right' : 'left'} scale={0.8} />
      <NumberStack value={scene.right} glow={glowRight} />
    </div>
  );
}

export function SceneView({ scene, size = 'lg' }: { scene: Scene; size?: FrameSize }) {
  return scene.kind === 'compare' ? (
    <CompareView scene={scene} />
  ) : (
    <FramesView scene={scene} size={size} />
  );
}
