import { describe, expect, it } from 'vitest';
import { factWeight, mastery, nextBox, pickFacts, statsMap } from './leitner';
import {
  EMPTY_PROGRESS,
  applyAnswer,
  applySession,
  dayKey,
  streakDays,
  totalStars,
} from './progress';
import { allFacts, makeQuestion } from './questions';
import {
  answerQuestion,
  buildQuestions,
  currentQuestion,
  dailyTopics,
  isFinished,
  score,
  startSession,
  starsFor,
} from './session';
import type { FactStat } from './types';

/** Small deterministic random generator for tests. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const stat = (factId: string, box: number): FactStat => ({
  factId,
  topic: 'add10',
  box,
  correct: 0,
  wrong: 0,
  lastSeen: 0,
});

describe('leitner', () => {
  it('moves up on right, back to 1 on wrong', () => {
    expect(nextBox(0, true)).toBe(2);
    expect(nextBox(2, true)).toBe(3);
    expect(nextBox(5, true)).toBe(5);
    expect(nextBox(4, false)).toBe(1);
  });

  it('asks weak facts more often than learned ones', () => {
    expect(factWeight('add10:1:1', stat('add10:1:1', 1))).toBeGreaterThan(
      factWeight('add10:1:2', stat('add10:1:2', 5)),
    );
  });

  it('prefers weak facts when picking', () => {
    const pool = ['add10:1:1', 'add10:1:2'];
    const stats = statsMap([stat('add10:1:1', 1), stat('add10:1:2', 5)]);
    const rng = seeded(1);
    let weakFirst = 0;
    for (let i = 0; i < 200; i++)
      if (pickFacts(pool, stats, 1, rng)[0] === 'add10:1:1') weakFirst++;
    expect(weakFirst).toBeGreaterThan(130);
  });

  it('cycles small pools without the same fact twice in a row', () => {
    const picked = pickFacts(allFacts('pairs10'), new Map(), 10, seeded(3));
    expect(picked).toHaveLength(10);
    for (let i = 1; i < picked.length; i++) expect(picked[i]).not.toBe(picked[i - 1]);
  });

  it('handles a pool of one', () => {
    expect(pickFacts(['add10:1:1'], new Map(), 3, seeded(2))).toHaveLength(3);
  });

  it('measures mastery', () => {
    const pool = ['a', 'b', 'c', 'd'];
    expect(mastery(pool, statsMap([stat('a', 3), stat('b', 1)]))).toBe(0.25);
  });
});

describe('session', () => {
  const questions = [makeQuestion('add10', 1, 1), makeQuestion('add10', 2, 2)];

  it('repeats a missed question once at the end', () => {
    let s = startSession(questions);
    s = answerQuestion(s, false);
    expect(s.queue).toHaveLength(3);
    s = answerQuestion(s, true);
    expect(currentQuestion(s)?.factId).toBe('add10:1:1');
    s = answerQuestion(s, false);
    expect(s.queue).toHaveLength(3);
    expect(isFinished(s)).toBe(true);
    expect(score(s)).toBe(1);
    expect(s.missed).toEqual(['add10:1:1']);
  });

  it('tracks streaks', () => {
    let s = startSession(questions);
    s = answerQuestion(s, true);
    s = answerQuestion(s, true);
    expect(s.bestStreak).toBe(2);
  });

  it('gives at least one star for finishing', () => {
    expect(starsFor(10, 10)).toBe(3);
    expect(starsFor(8, 10)).toBe(2);
    expect(starsFor(2, 10)).toBe(1);
  });

  it('builds a full round of questions', () => {
    expect(buildQuestions('bridgeAdd', [], EMPTY_PROGRESS, seeded(5))).toHaveLength(10);
    expect(buildQuestions('daily', [], EMPTY_PROGRESS, seeded(5))).toHaveLength(10);
  });

  it('daily mix uses topics that were played', () => {
    const p = applySession(EMPTY_PROGRESS, {
      key: 'sub10:practice',
      score: 5,
      total: 10,
      stars: 1,
    });
    expect(dailyTopics(p)).toEqual(['sub10']);
    expect(dailyTopics(EMPTY_PROGRESS)).toEqual(['compare', 'add10']);
  });
});

describe('progress', () => {
  it('updates fact boxes and the day', () => {
    let p = applyAnswer(EMPTY_PROGRESS, {
      factId: 'add10:1:1',
      topic: 'add10',
      correct: true,
      day: '2026-10-04',
      at: 1,
    });
    p = applyAnswer(p, {
      factId: 'add10:1:1',
      topic: 'add10',
      correct: false,
      day: '2026-10-04',
      at: 2,
    });
    expect(p.facts).toEqual([
      { factId: 'add10:1:1', topic: 'add10', box: 1, correct: 1, wrong: 1, lastSeen: 2 },
    ]);
    expect(p.days).toEqual([{ day: '2026-10-04', answers: 2, correct: 1 }]);
  });

  it('keeps the best stars', () => {
    let p = applySession(EMPTY_PROGRESS, { key: 'add10:practice', score: 10, total: 10, stars: 3 });
    p = applySession(p, { key: 'add10:practice', score: 4, total: 10, stars: 1 });
    expect(p.topics[0]).toEqual({ key: 'add10:practice', stars: 3, bestScore: 10, sessions: 2 });
    expect(totalStars(p)).toBe(3);
  });

  it('counts practice days in a row', () => {
    const day = (d: string) => ({ day: d, answers: 3, correct: 3 });
    const p = { ...EMPTY_PROGRESS, days: [day('2026-10-02'), day('2026-10-03')] };
    expect(streakDays(p, new Date(2026, 9, 4))).toBe(2);
    expect(streakDays(p, new Date(2026, 9, 6))).toBe(0);
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
