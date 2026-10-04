import { motion } from 'motion/react';
import type { CrocState } from '../logic/types';

const OPEN_ANGLE = 27;
const SNAP_ANGLE = 4;

function UpperJaw() {
  return (
    <svg width="124" height="52" viewBox="0 0 124 52" aria-hidden>
      {[26, 44, 62, 80].map((x) => (
        <path
          key={x}
          d={`M${x} 39 L${x + 11} 39 L${x + 5.5} 50 Z`}
          fill="#fff"
          stroke="var(--color-ink)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      ))}
      <path
        d="M120 40 L12 40 Q3 40 4 31 Q7 19 24 17 L90 12 Q112 12 120 40 Z"
        fill="var(--color-grass)"
        stroke="var(--color-ink)"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <circle cx="20" cy="25" r="2.5" fill="var(--color-ink)" />
      <circle cx="88" cy="12" r="10" fill="#fff" stroke="var(--color-ink)" strokeWidth={3.5} />
      <circle cx="85" cy="12" r="5" fill="var(--color-ink)" />
      <circle cx="83.5" cy="10" r="1.6" fill="#fff" />
    </svg>
  );
}

function LowerJaw() {
  return (
    <svg width="124" height="52" viewBox="0 0 124 52" aria-hidden>
      {[34, 52, 70].map((x) => (
        <path
          key={x}
          d={`M${x} 13 L${x + 11} 13 L${x + 5.5} 2 Z`}
          fill="#fff"
          stroke="var(--color-ink)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      ))}
      <path
        d="M120 12 L12 12 Q3 12 4 21 Q8 32 26 33 L88 36 Q112 34 120 12 Z"
        fill="#7be3a5"
        stroke="var(--color-ink)"
        strokeWidth={4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Props {
  state: CrocState;
  /** Which way the hungry crocodile looks (its mouth opens that way). */
  facing?: 'left' | 'right';
  /** Scale of the 160×140 drawing. */
  scale?: number;
}

/**
 * The hungry crocodile that is also the < and > sign.
 * Its mouth always opens towards the bigger number.
 */
export function Croc({ state, facing = 'left', scale = 1 }: Props) {
  const box = { width: 160 * scale, height: 140 * scale };

  if (state === 'hidden') {
    return (
      <div className="flex items-center justify-center" style={box}>
        <motion.div
          className="flex h-[70%] w-[62%] items-center justify-center rounded-3xl border-4 border-dashed border-ink/40 bg-white text-6xl font-bold text-ink/40"
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ?
        </motion.div>
      </div>
    );
  }

  if (state === '=') {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={box}>
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="h-[16%] w-[70%] rounded-full border-4 border-ink bg-grass"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 300, damping: 16 }}
          />
        ))}
      </div>
    );
  }

  const hungry = state === 'hungry';
  const flip = state === '<' || (hungry && facing === 'right') ? -1 : 1;
  const jaw = hungry
    ? { rotate: [SNAP_ANGLE, OPEN_ANGLE * 0.8, SNAP_ANGLE] }
    : { rotate: [SNAP_ANGLE, OPEN_ANGLE + 6, OPEN_ANGLE] };
  const jawTransition = hungry
    ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' as const }
    : { duration: 0.5, ease: 'easeOut' as const };

  return (
    <div style={box} className="relative" role="img" aria-label={hungry ? 'Krokotiili' : state}>
      <motion.div
        className="absolute top-0 left-0 h-[140px] w-[160px] origin-top-left"
        style={{ scale }}
      >
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ scaleX: flip }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <motion.div
            className="absolute"
            style={{ left: 16, top: 30, transformOrigin: '120px 40px' }}
            animate={jaw}
            transition={jawTransition}
          >
            <UpperJaw />
          </motion.div>
          <motion.div
            className="absolute"
            style={{ left: 16, top: 58, transformOrigin: '120px 12px' }}
            animate={{ rotate: (jaw.rotate as number[]).map((r) => -r) }}
            transition={jawTransition}
          >
            <LowerJaw />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
