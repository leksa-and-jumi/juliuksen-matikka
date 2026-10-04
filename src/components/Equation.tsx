import { motion } from 'motion/react';
import { MINUS } from '../logic/questions';
import type { Token } from '../logic/types';

const OPERATOR_COLOR: Record<string, string> = {
  '+': 'text-tomato',
  [MINUS]: 'text-sky',
  '=': 'text-ink',
  '<': 'text-grass',
  '>': 'text-grass',
};

interface Props {
  tokens: Token[];
  /** What the child has typed into the blank. */
  value?: string;
  highlight?: number;
  state?: 'idle' | 'right' | 'wrong';
  size?: 'xl' | 'lg';
}

export function Equation({ tokens, value = '', highlight, state = 'idle', size = 'xl' }: Props) {
  const text = size === 'xl' ? 'text-6xl sm:text-8xl' : 'text-5xl sm:text-6xl';
  const blank = size === 'xl' ? 'min-w-20 sm:min-w-28 h-20 sm:h-28' : 'min-w-16 h-16 sm:h-20';
  return (
    <motion.div
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-bold sm:gap-x-5 ${text}`}
      animate={state === 'wrong' ? { x: [0, -16, 16, -10, 10, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
      aria-live="polite"
    >
      {tokens.map((t, i) => {
        if (t === '?') {
          return (
            <motion.span
              key={i}
              className={`flex items-center justify-center rounded-2xl border-4 px-3 ${blank} ${
                state === 'right'
                  ? 'border-ink bg-grass text-white'
                  : state === 'wrong'
                    ? 'border-ink bg-tomato text-white'
                    : value
                      ? 'border-ink bg-white'
                      : 'border-dashed border-ink/50 bg-sun-soft'
              }`}
              animate={!value && state === 'idle' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ duration: 1.4, repeat: !value && state === 'idle' ? Infinity : 0 }}
            >
              {value || <span className="text-ink/30">?</span>}
            </motion.span>
          );
        }
        const isHighlight = i === highlight;
        return (
          <motion.span
            key={`${i}-${t}`}
            className={`relative ${OPERATOR_COLOR[t] ?? 'text-ink'}`}
            initial={{ opacity: 0, y: 14 }}
            animate={isHighlight ? { opacity: 1, y: [0, -10, 0] } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.04 }}
          >
            {t}
            {isHighlight && (
              <motion.span
                className="absolute right-0 -bottom-1 left-0 h-2 rounded-full bg-sun"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
              />
            )}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
