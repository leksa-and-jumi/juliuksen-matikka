import { describe, expect, it } from 'vitest';
import { countCells, fillFrames } from './scenes';
import {
  allFacts,
  compareSign,
  explain,
  factId,
  makeQuestion,
  parseFactId,
  questionFromFact,
  splitForAdd,
  splitForSub,
  tokensToSpeech,
} from './questions';
import { TOPICS } from './topics';
import type { FramesScene } from './types';

describe('facts', () => {
  it('round-trips fact ids', () => {
    expect(parseFactId(factId('bridgeAdd', 8, 5))).toEqual({ topic: 'bridgeAdd', a: 8, b: 5 });
    expect(parseFactId('nope:1:2')).toBeNull();
    expect(parseFactId('add10:x:2')).toBeNull();
  });

  it('keeps every topic inside its number range', () => {
    for (const id of allFacts('add10')) {
      const q = questionFromFact(id);
      expect(q && q.a + q.b).toBeLessThanOrEqual(10);
    }
    for (const id of allFacts('sub10')) {
      const q = questionFromFact(id);
      expect(q && q.a - q.b).toBeGreaterThanOrEqual(0);
    }
    for (const id of allFacts('bridgeAdd')) {
      const q = questionFromFact(id);
      expect(q && q.a + q.b).toBeGreaterThan(10);
      expect(q && q.b).toBeLessThan(10);
    }
    for (const id of allFacts('bridgeSub')) {
      const q = questionFromFact(id);
      expect(q && q.a).toBeGreaterThan(10);
      expect(q && q.a - q.b).toBeLessThan(10);
      expect(q && q.a - q.b).toBeGreaterThan(0);
    }
  });

  it('has the expected number of facts', () => {
    expect(allFacts('pairs10')).toHaveLength(9);
    expect(allFacts('add10')).toHaveLength(45);
    expect(allFacts('bridgeAdd')).toHaveLength(36);
    expect(allFacts('bridgeSub')).toHaveLength(36);
  });
});

describe('answers', () => {
  it('compares numbers like the hungry crocodile', () => {
    expect(compareSign(3, 7)).toBe('<');
    expect(compareSign(9, 2)).toBe('>');
    expect(compareSign(5, 5)).toBe('=');
    expect(makeQuestion('compare', 12, 4).answer).toBe('>');
  });

  it('computes answers for every topic', () => {
    expect(makeQuestion('add10', 4, 3).answer).toBe(7);
    expect(makeQuestion('sub10', 8, 3).answer).toBe(5);
    expect(makeQuestion('pairs10', 7, 3).answer).toBe(3);
    expect(makeQuestion('bridgeAdd', 8, 5).answer).toBe(13);
    expect(makeQuestion('bridgeSub', 13, 5).answer).toBe(8);
  });
});

describe('bridging ten', () => {
  it('splits 8 + 5 into 8 + 2 + 3', () => {
    expect(splitForAdd(8, 5)).toEqual({ need: 2, rest: 3 });
  });

  it('splits 13 − 5 into 13 − 3 − 2', () => {
    expect(splitForSub(13, 5)).toEqual({ ones: 3, rest: 2 });
  });

  it('gives three small steps that lead to the answer', () => {
    const add = makeQuestion('bridgeAdd', 8, 5);
    expect(add.steps?.map((s) => s.answer)).toEqual([2, 3, 13]);
    const sub = makeQuestion('bridgeSub', 13, 5);
    expect(sub.steps?.map((s) => s.answer)).toEqual([3, 2, 8]);
  });

  it('every step of every fact has a positive split', () => {
    for (const topic of ['bridgeAdd', 'bridgeSub'] as const) {
      for (const id of allFacts(topic)) {
        const q = questionFromFact(id);
        for (const step of q?.steps ?? []) expect(step.answer).toBeGreaterThan(0);
      }
    }
  });
});

describe('scenes', () => {
  it('fills frames in reading order', () => {
    const frames = fillFrames([
      ['red', 8],
      ['blue', 5],
    ]);
    expect(frames).toHaveLength(2);
    expect(frames[0]?.filter((c) => c === 'red')).toHaveLength(8);
    expect(frames[0]?.filter((c) => c === 'blue')).toHaveLength(2);
    expect(frames[1]?.filter((c) => c === 'blue')).toHaveLength(3);
  });

  it('final explanation scene matches the answer', () => {
    for (const topic of TOPICS) {
      if (topic.id === 'compare') continue;
      for (const id of allFacts(topic.id)) {
        const q = questionFromFact(id);
        if (!q) throw new Error(id);
        const last = explain(q).at(-1);
        const scene = last?.scene as FramesScene;
        const shown = countCells(scene, 'red') + countCells(scene, 'blue');
        const expected = topic.id === 'pairs10' ? 10 : q.answer;
        expect(shown, id).toBe(expected);
        expect(last?.tokens).not.toContain('?');
      }
    }
  });

  it('explains compare with the crocodile eating the bigger number', () => {
    const steps = explain(makeQuestion('compare', 3, 7));
    expect(steps.at(-1)?.tokens).toEqual(['3', '<', '7']);
    expect(steps.some((s) => s.scene.kind === 'compare' && s.scene.croc === '<')).toBe(true);
  });
});

describe('speech', () => {
  it('reads equations aloud in Finnish', () => {
    expect(tokensToSpeech(['8', '+', '5', '=', '13'])).toBe('8 plus 5 on 13');
    expect(tokensToSpeech(['3', '<', '7'])).toBe('3 on pienempi kuin 7');
  });
});

describe('labels', () => {
  it('labels facts for lists', async () => {
    const { factLabel } = await import('./questions');
    expect(factLabel('bridgeAdd:8:5')).toBe('8 + 5');
    expect(factLabel('compare:3:7')).toBe('3 ○ 7');
    expect(factLabel('pairs10:7:3')).toBe('7 + ? = 10');
  });
});
