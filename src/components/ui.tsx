import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { speak } from '../audio/speech';

export function Stars({
  count,
  max = 3,
  size = 'md',
}: {
  count: number;
  max?: number;
  size?: 'md' | 'lg';
}) {
  const text = size === 'lg' ? 'text-6xl sm:text-7xl' : 'text-2xl';
  return (
    <span className={`inline-flex gap-0.5 ${text}`} aria-label={`${count} / ${max} tähteä`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? '' : 'opacity-20 grayscale'}>
          ⭐
        </span>
      ))}
    </span>
  );
}

export function BackButton({
  onClick,
  label = 'Takaisin',
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      className="chunky flex h-14 items-center gap-2 bg-white px-4 text-xl font-bold"
      onClick={onClick}
      aria-label={label}
    >
      <span className="text-2xl">←</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function SpeakButton({ text, className = '' }: { text: string; className?: string }) {
  return (
    <button
      className={`chunky flex h-12 w-12 shrink-0 items-center justify-center bg-white text-2xl ${className}`}
      onClick={() => speak(text, true)}
      aria-label="Lue ääneen"
      title="Lue ääneen"
    >
      🔊
    </button>
  );
}

/** Pöllö-ope, the owl teacher, with a speech bubble. */
export function Teacher({ children, say }: { children: ReactNode; say?: string }) {
  return (
    <div className="flex items-end gap-2 sm:gap-3">
      <motion.div
        className="text-5xl sm:text-6xl"
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        aria-hidden
      >
        🦉
      </motion.div>
      <div className="relative flex flex-1 items-center gap-3 rounded-3xl border-4 border-ink bg-white px-4 py-3 shadow-chunky-sm">
        <span className="absolute bottom-4 -left-3 h-5 w-5 rotate-45 border-b-4 border-l-4 border-ink bg-white" />
        <div className="relative flex-1 text-xl leading-snug font-semibold sm:text-2xl">
          {children}
        </div>
        {say && <SpeakButton text={say} />}
      </div>
    </div>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <motion.main
      className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.main>
  );
}
