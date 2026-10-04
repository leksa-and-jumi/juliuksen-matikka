import { AnimatePresence, motion } from 'motion/react';
import { COUNTER_STAGGER, COUNT_STAGGER } from '../config';
import type { Cell } from '../logic/types';

export type FrameSize = 'lg' | 'md' | 'sm';

const CELL_SIZE: Record<FrameSize, string> = {
  lg: 'clamp(34px, 8.5vw, 62px)',
  md: 'clamp(28px, 6.5vw, 46px)',
  sm: 'clamp(13px, 3.4vw, 32px)',
};

const LABEL_TEXT: Record<FrameSize, string> = {
  lg: 'text-[clamp(14px,3.6vw,26px)]',
  md: 'text-[clamp(12px,2.8vw,20px)]',
  sm: 'text-[clamp(9px,1.8vw,15px)]',
};

interface Props {
  cells: Cell[];
  size?: FrameSize;
  /** Running count number per cell, or null. */
  labels?: (number | null)[];
}

/** Ordinal of each cell among cells of the same kind, used to stagger animations. */
function ordinals(cells: Cell[]): number[] {
  const seen: Partial<Record<Cell, number>> = {};
  return cells.map((c) => {
    const n = seen[c] ?? 0;
    seen[c] = n + 1;
    return n;
  });
}

export function TenFrame({ cells, size = 'lg', labels }: Props) {
  const order = ordinals(cells);
  const cellSize = CELL_SIZE[size];
  return (
    <div
      className="grid grid-cols-5 gap-[5px] rounded-2xl border-4 border-ink bg-white p-[5px]"
      role="img"
      aria-label={`Kymppiruudukko: ${cells.filter((c) => c === 'red' || c === 'blue').length} palloa`}
    >
      {cells.map((cell, i) => {
        const delay = (order[i] ?? 0) * COUNTER_STAGGER;
        const label = labels?.[i] ?? null;
        const isCounter = cell === 'red' || cell === 'blue' || cell === 'gone';
        return (
          <div
            key={i}
            className="relative rounded-xl border-2 border-dashed border-ink/15 bg-paper/70"
            style={{ width: cellSize, height: cellSize }}
          >
            {cell === 'hint' && (
              <motion.div
                className="absolute inset-[10%] rounded-full border-4 border-dashed border-sun bg-sun-soft"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: delay / 2 }}
              />
            )}
            <AnimatePresence>
              {isCounter && (
                <motion.div
                  key="counter"
                  className={`absolute inset-[9%] flex items-center justify-center rounded-full border-[3px] border-ink ${
                    cell === 'blue' ? 'bg-sky' : 'bg-tomato'
                  }`}
                  initial={{ scale: 0, y: -40, opacity: 0 }}
                  animate={
                    cell === 'gone'
                      ? { scale: 0.78, y: -4, opacity: 0.28, rotate: 25 }
                      : { scale: 1, y: 0, opacity: 1, rotate: 0 }
                  }
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 24, delay }}
                >
                  <span className="absolute top-[14%] left-[20%] h-[24%] w-[30%] rounded-full bg-white/60" />
                  <AnimatePresence>
                    {label !== null && (
                      <motion.span
                        key="label"
                        className={`relative font-bold text-white ${LABEL_TEXT[size]}`}
                        style={{ textShadow: '0 2px 0 var(--color-ink)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 1] }}
                        exit={{ scale: 0 }}
                        transition={{ delay: (label - 1) * COUNT_STAGGER, duration: 0.35 }}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
            {cell === 'gone' && (
              <svg className="pointer-events-none absolute inset-0" viewBox="0 0 10 10">
                <motion.path
                  d="M2 2 L8 8 M8 2 L2 8"
                  stroke="var(--color-ink)"
                  strokeWidth={1.3}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: delay + 0.15, duration: 0.3 }}
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
