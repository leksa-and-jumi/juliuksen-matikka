import { DAILY_UNSEEN_WEIGHT, SESSION_LENGTH, TWO_STAR_SHARE } from '../config';
import { pickFacts, statsMap } from './leitner';
import { allFacts, questionFromFact } from './questions';
import { TOPICS } from './topics';
import type { FactStat, Progress, Question, Rng, TopicId } from './types';

export type SessionTarget = TopicId | 'daily';

export interface SessionState {
  queue: Question[];
  index: number;
  /** factIds answered right on the first try. */
  firstTryRight: string[];
  /** factIds that were missed (and repeated at the end). */
  missed: string[];
  streak: number;
  bestStreak: number;
  /** Number of original questions (score is out of this). */
  total: number;
}

function toQuestions(ids: string[]): Question[] {
  return ids.map(questionFromFact).filter((q): q is Question => q !== null);
}

/** Topics the daily mix uses: ones already practised, or the first two to begin with. */
export function dailyTopics(progress: Progress): TopicId[] {
  const played = TOPICS.filter((t) =>
    progress.topics.some((s) => s.key.startsWith(`${t.id}:`) && s.sessions > 0),
  ).map((t) => t.id);
  return played.length > 0 ? played : ['compare', 'add10'];
}

export function buildQuestions(
  target: SessionTarget,
  facts: readonly FactStat[],
  progress: Progress,
  rng: Rng,
  count = SESSION_LENGTH,
): Question[] {
  const stats = statsMap(facts);
  if (target === 'daily') {
    const pool = dailyTopics(progress).flatMap(allFacts);
    return toQuestions(pickFacts(pool, stats, count, rng, DAILY_UNSEEN_WEIGHT));
  }
  return toQuestions(pickFacts(allFacts(target), stats, count, rng));
}

export function startSession(questions: Question[]): SessionState {
  return {
    queue: questions,
    index: 0,
    firstTryRight: [],
    missed: [],
    streak: 0,
    bestStreak: 0,
    total: questions.length,
  };
}

export function currentQuestion(state: SessionState): Question | undefined {
  return state.queue[state.index];
}

export function isFinished(state: SessionState): boolean {
  return state.index >= state.queue.length;
}

/**
 * Records an answer and moves on. A missed question goes once more to the end
 * of the queue, so the child gets to try it again after seeing the explanation.
 */
export function answerQuestion(state: SessionState, correct: boolean): SessionState {
  const q = currentQuestion(state);
  if (!q) return state;
  const firstAttempt = state.index < state.total;
  const streak = correct ? state.streak + 1 : 0;
  const next: SessionState = {
    ...state,
    index: state.index + 1,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
  };
  if (correct && firstAttempt) next.firstTryRight = [...state.firstTryRight, q.factId];
  if (!correct) {
    if (!state.missed.includes(q.factId)) next.missed = [...state.missed, q.factId];
    if (firstAttempt) next.queue = [...state.queue, q];
  }
  return next;
}

export function score(state: SessionState): number {
  return state.firstTryRight.length;
}

export function starsFor(score: number, total: number): number {
  if (total <= 0) return 0;
  if (score >= total) return 3;
  if (score >= total * TWO_STAR_SHARE) return 2;
  return 1;
}
