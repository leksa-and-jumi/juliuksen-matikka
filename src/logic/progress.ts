import { MIN_BOX } from '../config';
import { nextBox } from './leitner';
import type { Mode, Progress, TopicId, TopicStat } from './types';

export const EMPTY_PROGRESS: Progress = { topics: [], facts: [], days: [] };

export interface AnswerInput {
  factId: string;
  topic: TopicId;
  correct: boolean;
  day: string;
  at: number;
}

export interface SessionResult {
  key: string;
  score: number;
  total: number;
  stars: number;
}

export function topicKey(topic: TopicId | 'daily', mode: Mode): string {
  return `${topic}:${mode}`;
}

/** Local calendar date as YYYY-MM-DD. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function applyAnswer(progress: Progress, input: AnswerInput): Progress {
  const existing = progress.facts.find((f) => f.factId === input.factId);
  const fact = existing ?? {
    factId: input.factId,
    topic: input.topic,
    box: MIN_BOX - 1,
    correct: 0,
    wrong: 0,
    lastSeen: 0,
  };
  const updated = {
    ...fact,
    box: nextBox(fact.box, input.correct),
    correct: fact.correct + (input.correct ? 1 : 0),
    wrong: fact.wrong + (input.correct ? 0 : 1),
    lastSeen: input.at,
  };
  const day = progress.days.find((d) => d.day === input.day) ?? {
    day: input.day,
    answers: 0,
    correct: 0,
  };
  const updatedDay = {
    ...day,
    answers: day.answers + 1,
    correct: day.correct + (input.correct ? 1 : 0),
  };
  return {
    ...progress,
    facts: [...progress.facts.filter((f) => f.factId !== input.factId), updated],
    days: [...progress.days.filter((d) => d.day !== input.day), updatedDay],
  };
}

export function applySession(progress: Progress, result: SessionResult): Progress {
  const existing = progress.topics.find((t) => t.key === result.key);
  const updated: TopicStat = {
    key: result.key,
    stars: Math.max(existing?.stars ?? 0, result.stars),
    bestScore: Math.max(existing?.bestScore ?? 0, result.score),
    sessions: (existing?.sessions ?? 0) + 1,
  };
  return {
    ...progress,
    topics: [...progress.topics.filter((t) => t.key !== result.key), updated],
  };
}

export function starsOf(progress: Progress, key: string): number {
  return progress.topics.find((t) => t.key === key)?.stars ?? 0;
}

export function totalStars(progress: Progress): number {
  return progress.topics.reduce((sum, t) => sum + t.stars, 0);
}

/** Days in a row with practice, ending today (or yesterday if today is not played yet). */
export function streakDays(progress: Progress, today: Date): number {
  const played = new Set(progress.days.filter((d) => d.answers > 0).map((d) => d.day));
  const cursor = new Date(today);
  if (!played.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (played.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
