import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../audio/sfx';
import { speak, stopSpeaking } from '../audio/speech';
import { NumberPad, SignPad } from '../components/AnswerPads';
import { Equation } from '../components/Equation';
import { ExplainPlayer } from '../components/ExplainPlayer';
import { SceneView } from '../components/SceneView';
import { BackButton, Screen, Teacher } from '../components/ui';
import { topicStyle } from '../components/topicStyle';
import { FEEDBACK_DELAY_MS, STREAK_CHEER } from '../config';
import type { AnswerInput, SessionResult } from '../logic/progress';
import { dayKey, topicKey } from '../logic/progress';
import { explain } from '../logic/questions';
import {
  answerQuestion,
  buildQuestions,
  currentQuestion,
  isFinished,
  score,
  startSession,
  starsFor,
  type SessionTarget,
} from '../logic/session';
import { topicInfo } from '../logic/topics';
import type { Answer, CompareSign, Mode, Progress, Scene } from '../logic/types';

const PRAISE = [
  'Oikein! 🎉',
  'Mahtavaa! ⭐',
  'Huippua! 🚀',
  'Jee! 🙌',
  'Loistavaa! 💪',
  'Nappiin! 🎯',
];
const MAX_DIGITS = 2;

type Phase = 'answer' | 'right' | 'wrong' | 'hint' | 'reveal' | 'solved' | 'explain';

export interface FinishInfo {
  result: SessionResult;
  missed: string[];
  bestStreak: number;
}

interface Props {
  target: SessionTarget;
  mode: Mode;
  progress: Progress;
  onAnswer: (input: AnswerInput) => void;
  onFinish: (info: FinishInfo) => void;
  onBack: () => void;
}

function cheerFor(streak: number): string | null {
  if (streak === 10) return '10 oikein putkeen!!! 🏆';
  if (streak === 5) return '5 putkeen! Olet liekeissä! 🔥🔥';
  if (streak === STREAK_CHEER) return '3 oikein putkeen! 🔥';
  return null;
}

export function PracticeScreen({ target, mode, progress, onAnswer, onFinish, onBack }: Props) {
  const [session, setSession] = useState(() =>
    startSession(buildQuestions(target, progress.facts, progress, Math.random)),
  );
  const [results, setResults] = useState<boolean[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('answer');
  const [mistake, setMistake] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cheer, setCheer] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms = FEEDBACK_DELAY_MS) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
      stopSpeaking();
    },
    [],
  );

  const q = currentQuestion(session);
  const stepped = mode === 'practice' && target !== 'daily' && !!q?.steps;
  const step = stepped ? q?.steps?.[stepIndex] : undefined;

  // Read the task aloud when it changes.
  const sayText = step?.say ?? q?.say;
  useEffect(() => {
    if (sayText) speak(sayText);
  }, [session.index, stepIndex, sayText]);

  const finalize = useCallback(
    (correct: boolean) => {
      if (!q) return;
      const now = new Date();
      onAnswer({ factId: q.factId, topic: q.topic, correct, day: dayKey(now), at: now.getTime() });
      const next = answerQuestion(session, correct);
      setResults((r) => [...r, correct]);
      setCheer(correct ? cheerFor(next.streak) : null);
      if (isFinished(next)) {
        const total = next.total;
        const s = score(next);
        onFinish({
          result: {
            key: topicKey(target, target === 'daily' ? 'challenge' : mode),
            score: s,
            total,
            stars: starsFor(s, total),
          },
          missed: next.missed,
          bestStreak: next.bestStreak,
        });
        return;
      }
      setSession(next);
      setStepIndex(0);
      setInput('');
      setPhase('answer');
      setMistake(false);
      setShowHelp(false);
    },
    [q, session, onAnswer, onFinish, target, mode],
  );

  const advanceStep = useCallback(
    (hadMistake: boolean) => {
      if (!q?.steps) return;
      if (stepIndex < q.steps.length - 1) {
        setStepIndex(stepIndex + 1);
        setInput('');
        setPhase('answer');
      } else {
        setPhase('solved');
        sfx.fanfare();
        speak(`${q.tokens.slice(0, 3).join(' ')} on ${String(q.answer)}!`);
        later(() => finalize(!hadMistake), FEEDBACK_DELAY_MS * 2);
      }
    },
    [q, stepIndex, later, finalize],
  );

  const submit = useCallback(
    (value: Answer) => {
      if (!q || (phase !== 'answer' && phase !== 'hint')) return;
      const expected = step ? step.answer : q.answer;
      if (value === expected) {
        sfx.correct();
        setPhase('right');
        void confetti({
          particleCount: 45,
          spread: 70,
          startVelocity: 35,
          origin: { y: 0.45 },
          disableForReducedMotion: true,
        });
        later(() => (step ? advanceStep(mistake) : finalize(!mistake)));
        return;
      }
      sfx.wrong();
      setMistake(true);
      const secondMiss = phase === 'hint';
      setPhase('wrong');
      later(() => {
        if (!step) {
          setPhase('explain');
        } else if (secondMiss) {
          setInput(String(expected));
          setPhase('reveal');
          later(() => advanceStep(true), FEEDBACK_DELAY_MS * 1.6);
        } else {
          setInput('');
          setPhase('hint');
          speak(step.hint);
        }
      });
    },
    [q, phase, step, mistake, later, advanceStep, finalize],
  );

  const typing = phase === 'answer' || phase === 'hint';
  const addDigit = useCallback(
    (d: string) => {
      if (typing) setInput((v) => (v.length >= MAX_DIGITS ? v : v === '0' ? d : v + d));
    },
    [typing],
  );
  const removeDigit = useCallback(() => {
    if (typing) setInput((v) => v.slice(0, -1));
  }, [typing]);
  const submitInput = useCallback(() => {
    if (input) submit(Number(input));
  }, [input, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'explain') return;
      if (/^[0-9]$/.test(e.key)) addDigit(e.key);
      else if (e.key === 'Backspace') removeDigit();
      else if (e.key === 'Enter') submitInput();
      else if (e.key === '<' || e.key === '>' || e.key === '=') submit(e.key as CompareSign);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, addDigit, removeDigit, submitInput, submit]);

  const explainSteps = useMemo(() => (q ? explain(q) : []), [q]);

  if (!q) return null;

  const info = target === 'daily' ? null : topicInfo(target);
  const tokens = step ? step.tokens : q.tokens;
  const isCompare = q.topic === 'compare';
  let scene: Scene = step ? step.scene : q.scene;
  if (isCompare && scene.kind === 'compare' && (phase === 'right' || phase === 'explain')) {
    scene = {
      ...scene,
      croc: q.answer as CompareSign,
      glow: q.a > q.b ? 'left' : q.a < q.b ? 'right' : 'both',
    };
  }
  const helpAvailable = mode === 'challenge' || target === 'daily';
  const showScene = !helpAvailable || showHelp || isCompare;
  const solvedTokens = q.tokens.map((t) => (t === '?' ? String(q.answer) : t));
  const shownTokens =
    phase === 'solved' ? solvedTokens : isCompare && phase === 'right' ? solvedTokens : tokens;
  const equationState =
    phase === 'right' || phase === 'solved' || phase === 'reveal'
      ? 'right'
      : phase === 'wrong'
        ? 'wrong'
        : 'idle';

  const teacherText =
    phase === 'right'
      ? (PRAISE[session.index % PRAISE.length] ?? 'Oikein!')
      : phase === 'wrong'
        ? 'Melkein! 🤔'
        : phase === 'hint'
          ? `Vinkki: ${step?.hint ?? ''}`
          : phase === 'reveal'
            ? `Katso: vastaus on ${String(step?.answer ?? '')}. Jatketaan!`
            : phase === 'solved'
              ? `Huippua! ${solvedTokens.join(' ')} 🎉`
              : isCompare
                ? 'Kumpi on suurempi? Valitse oikea merkki!'
                : step
                  ? step.say
                  : 'Paljonko on? Kirjoita vastaus!';

  const stepLabels = ['Täytä kymppi', 'Pilko', 'Laske loput'];

  return (
    <Screen>
      <div
        style={info ? topicStyle(info.color) : topicStyle('tangerine')}
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} label="Lopeta" />
          <div
            className="flex flex-1 gap-1"
            aria-label={`Tehtävä ${session.index + 1} / ${session.queue.length}`}
          >
            {session.queue.map((_, i) => (
              <div
                key={i}
                className={`h-5 flex-1 rounded-full border-2 border-ink ${
                  i < results.length
                    ? results[i]
                      ? 'bg-grass'
                      : 'bg-tangerine'
                    : i === session.index
                      ? 'bg-sun'
                      : 'bg-white'
                }`}
              />
            ))}
          </div>
          <div className="chunky flex h-12 min-w-16 items-center justify-center bg-white px-2 text-xl font-bold">
            🔥{session.streak}
          </div>
        </div>

        {stepped && q.steps && (
          <div className="flex justify-center gap-2">
            {q.steps.map((_, i) => (
              <span
                key={i}
                className={`rounded-full border-2 border-ink px-3 py-1 text-sm font-bold sm:text-base ${
                  i === stepIndex && phase !== 'solved'
                    ? 'bg-sun'
                    : i < stepIndex || phase === 'solved'
                      ? 'bg-grass text-white'
                      : 'bg-white'
                }`}
              >
                {i + 1}. {stepLabels[i]}
              </span>
            ))}
          </div>
        )}

        <div className="grid flex-1 gap-4 md:grid-cols-[minmax(0,1fr)_300px] md:items-start">
          <div className="flex min-w-0 flex-col gap-4">
            <Teacher say={sayText}>{teacherText}</Teacher>

            <motion.div
              key={`${session.index}`}
              className="panel relative flex flex-col items-center justify-center gap-5 p-4 sm:p-6"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {showScene && (
                <SceneView
                  scene={scene}
                  size={stepped || q.topic.startsWith('bridge') ? 'md' : 'lg'}
                />
              )}
              <Equation
                tokens={shownTokens}
                value={input}
                state={equationState}
                size={showScene && !isCompare ? 'lg' : 'xl'}
              />
              {helpAvailable && !isCompare && !showHelp && (
                <button
                  className="chunky absolute top-3 right-3 h-12 bg-sun-soft px-3 text-lg font-bold"
                  onClick={() => setShowHelp(true)}
                >
                  💡 Apu
                </button>
              )}
              <AnimatePresence>
                {cheer && phase === 'answer' && (
                  <motion.div
                    className="absolute -top-5 rounded-full border-4 border-ink bg-tangerine px-4 py-1 text-xl font-bold text-white"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                  >
                    {cheer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="md:sticky md:top-4">
            {isCompare ? (
              <SignPad onPick={submit} disabled={!typing} />
            ) : (
              <NumberPad
                onDigit={addDigit}
                onDelete={removeDigit}
                onSubmit={submitInput}
                canSubmit={input.length > 0}
                disabled={!typing}
              />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {phase === 'explain' && (
          <motion.div
            className="fixed inset-0 z-20 overflow-y-auto bg-ink/50 p-3 backdrop-blur-sm sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mx-auto flex max-w-3xl flex-col gap-4 rounded-[2rem] border-4 border-ink bg-paper p-4 sm:p-6"
              initial={{ y: 60 }}
              animate={{ y: 0 }}
            >
              <h2 className="text-center text-3xl font-bold">Katsotaan yhdessä! 🔍</h2>
              <ExplainPlayer
                steps={explainSteps}
                onDone={() => finalize(false)}
                doneLabel="Selvä! 👍"
              />
              {session.index < session.total && (
                <p className="text-center text-lg font-semibold text-muted">
                  🔁 Tämä tehtävä tulee vielä uudestaan.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
