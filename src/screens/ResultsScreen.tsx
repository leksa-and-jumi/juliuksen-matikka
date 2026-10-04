import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { sfx } from '../audio/sfx';
import { speak } from '../audio/speech';
import { Fireworks } from '../components/Fireworks';
import { Screen, Teacher } from '../components/ui';
import { FIREWORKS_MS, FIREWORKS_MS_THREE_STARS } from '../config';
import type { SessionResult } from '../logic/progress';
import { factLabel } from '../logic/questions';

interface Props {
  result: SessionResult;
  missed: string[];
  bestStreak: number;
  canChallenge: boolean;
  onAgain: () => void;
  onChallenge: () => void;
  onHome: () => void;
}

const MESSAGES = [
  '',
  'Hyvä, että harjoittelit! Joka kerta aivot vahvistuvat. 💪',
  'Tosi hienoa! Vielä vähän, niin saat kolme tähteä! ⭐',
  'TÄYDET PISTEET! Olet matikkamestari! 🏆',
];

export function ResultsScreen({
  result,
  missed,
  bestStreak,
  canChallenge,
  onAgain,
  onChallenge,
  onHome,
}: Props) {
  const message = MESSAGES[result.stars] ?? MESSAGES[1] ?? '';

  useEffect(() => {
    sfx.fanfare();
    speak(`${result.score} oikein ${result.total}:stä. ${message}`);
    void confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.35 },
      disableForReducedMotion: true,
    });
  }, [result, message]);

  return (
    <Screen>
      <Fireworks durationMs={result.stars === 3 ? FIREWORKS_MS_THREE_STARS : FIREWORKS_MS} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 pt-4 text-center">
        <h1 className="text-5xl font-bold sm:text-6xl">Valmis! 🎉</h1>
        <div className="flex gap-2 text-7xl sm:text-8xl">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.35, type: 'spring', stiffness: 300, damping: 12 }}
              className={i < result.stars ? '' : 'opacity-20 grayscale'}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        <div className="panel w-full p-5">
          <div className="text-5xl font-bold">
            {result.score} / {result.total}
          </div>
          <div className="text-xl font-semibold text-muted">oikein heti ensimmäisellä kerralla</div>
          {bestStreak >= 3 && (
            <div className="mt-2 text-xl font-bold">🔥 Pisin putki: {bestStreak}</div>
          )}
        </div>
        <div className="w-full text-left">
          <Teacher say={message}>{message}</Teacher>
        </div>
        {missed.length > 0 && (
          <div className="w-full">
            <h2 className="mb-2 text-xl font-bold">Nämä tulevat treeniin uudestaan:</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {missed.map((id) => (
                <span
                  key={id}
                  className="rounded-2xl border-4 border-ink bg-white px-3 py-1 text-2xl font-bold"
                >
                  {factLabel(id)}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-auto grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          <button className="chunky h-16 bg-sun text-2xl font-bold" onClick={onAgain}>
            🔁 Uudestaan
          </button>
          {canChallenge && (
            <button
              className="chunky h-16 bg-grape text-2xl font-bold text-white"
              onClick={onChallenge}
            >
              🚀 Haaste
            </button>
          )}
          <button
            className={`chunky h-16 bg-white text-2xl font-bold ${canChallenge ? '' : 'sm:col-span-2'}`}
            onClick={onHome}
          >
            🏠 Kotiin
          </button>
        </div>
      </div>
    </Screen>
  );
}
