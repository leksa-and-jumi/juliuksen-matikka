import { motion } from 'motion/react';
import type { Bond, BondValue } from '../logic/types';

function Bubble({ value, tone }: { value: BondValue; tone: 'whole' | 'part' }) {
  const unknown = value === '?';
  return (
    <motion.div
      key={String(value)}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className={`flex h-14 w-14 items-center justify-center rounded-full border-4 text-3xl font-bold sm:h-16 sm:w-16 sm:text-4xl ${
        unknown
          ? 'border-dashed border-ink bg-sun-soft text-ink/60'
          : tone === 'whole'
            ? 'border-ink bg-white text-ink'
            : 'border-ink bg-sky text-white'
      }`}
    >
      {value}
    </motion.div>
  );
}

/** "Number bond": the whole on top, its two parts below. */
export function NumberBond({ bond }: { bond: Bond }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex w-40 flex-col items-center sm:w-44"
      aria-label={`${bond.whole} on ${bond.left} ja ${bond.right}`}
    >
      <Bubble value={bond.whole} tone="whole" />
      <svg className="h-8 w-full" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden>
        <path
          d="M50 0 L18 20 M50 0 L82 20"
          stroke="var(--color-ink)"
          strokeWidth={4}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex w-full justify-between">
        <Bubble value={bond.left} tone="part" />
        <Bubble value={bond.right} tone="part" />
      </div>
    </motion.div>
  );
}
