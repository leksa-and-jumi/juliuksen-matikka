import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { sfx } from '../audio/sfx';
import { speak, stopSpeaking } from '../audio/speech';
import type { ExplainStep } from '../logic/types';
import { Equation } from './Equation';
import { SceneView } from './SceneView';
import { Teacher } from './ui';

interface Props {
  steps: ExplainStep[];
  onDone: () => void;
  doneLabel: string;
}

/** Shows an explanation one step at a time: picture, equation and the owl talking. */
export function ExplainPlayer({ steps, onDone, doneLabel }: Props) {
  const [index, setIndex] = useState(0);
  const step = steps[Math.min(index, steps.length - 1)];
  const last = index >= steps.length - 1;

  useEffect(() => {
    if (!step) return;
    speak(step.text);
    if (step.scene.kind === 'compare' && step.scene.croc !== 'hidden') sfx.chomp();
  }, [step]);

  useEffect(() => stopSpeaking, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, steps.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steps.length]);

  if (!step) return null;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="panel flex min-h-[300px] flex-col items-center justify-center gap-6 p-4 sm:min-h-[360px] sm:p-6">
        <SceneView scene={step.scene} />
        <AnimatePresence mode="wait">
          <motion.div
            key={step.tokens.join(' ')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Equation tokens={step.tokens} highlight={step.highlight} size="lg" />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <Teacher say={step.text}>{step.text}</Teacher>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3">
        <button
          className="chunky h-16 w-20 bg-white text-3xl font-bold sm:w-28"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Edellinen"
        >
          ◀
        </button>
        <div className="flex gap-2" aria-label={`Vaihe ${index + 1} / ${steps.length}`}>
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-4 rounded-full border-2 border-ink transition-all ${
                i === index ? 'w-10 bg-sun' : i < index ? 'w-4 bg-ink' : 'w-4 bg-white'
              }`}
            />
          ))}
        </div>
        {last ? (
          <button
            className="chunky h-16 bg-grass px-5 text-xl font-bold text-white sm:px-8 sm:text-2xl"
            onClick={onDone}
          >
            {doneLabel}
          </button>
        ) : (
          <motion.button
            className="chunky h-16 w-20 bg-sun text-3xl font-bold sm:w-28"
            onClick={() => setIndex((i) => i + 1)}
            aria-label="Seuraava"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: 2 }}
          >
            ▶
          </motion.button>
        )}
      </div>
    </div>
  );
}
