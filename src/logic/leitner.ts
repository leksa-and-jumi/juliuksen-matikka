import {
  BOX_WEIGHTS,
  COMPARE_EQUAL_BOOST,
  MASTERED_BOX,
  MAX_BOX,
  MIN_BOX,
  UNSEEN_WEIGHT,
} from '../config';
import { parseFactId } from './questions';
import type { FactStat, Rng } from './types';

/**
 * Leitner boxes: a right answer moves the fact one box up,
 * a wrong answer sends it back to box 1 so it comes back soon.
 */
export function nextBox(box: number, correct: boolean): number {
  if (!correct) return MIN_BOX;
  return Math.min(MAX_BOX, Math.max(MIN_BOX, box) + 1);
}

export function isMastered(stat: FactStat | undefined): boolean {
  return !!stat && stat.box >= MASTERED_BOX;
}

export function factWeight(
  factId: string,
  stat: FactStat | undefined,
  unseenWeight = UNSEEN_WEIGHT,
): number {
  const base = stat ? (BOX_WEIGHTS[stat.box] ?? 1) : unseenWeight;
  const parsed = parseFactId(factId);
  const equalBoost = parsed?.topic === 'compare' && parsed.a === parsed.b ? COMPARE_EQUAL_BOOST : 1;
  return base * equalBoost;
}

/**
 * Picks `count` facts, weak facts more likely. Without repeats while possible;
 * if the pool is smaller than `count`, the pool is cycled.
 */
export function pickFacts(
  pool: readonly string[],
  stats: ReadonlyMap<string, FactStat>,
  count: number,
  rng: Rng,
  unseenWeight = UNSEEN_WEIGHT,
): string[] {
  const picked: string[] = [];
  let remaining = [...pool];
  while (picked.length < count && pool.length > 0) {
    if (remaining.length === 0) remaining = [...pool];
    const weights = remaining.map((id) => factWeight(id, stats.get(id), unseenWeight));
    const total = weights.reduce((sum, w) => sum + w, 0);
    let roll = rng() * total;
    let index = remaining.length - 1;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i] ?? 0;
      if (roll < 0) {
        index = i;
        break;
      }
    }
    const [id] = remaining.splice(index, 1);
    // Avoid the same fact twice in a row when the pool is cycled.
    if (id !== undefined && (pool.length === 1 || picked[picked.length - 1] !== id))
      picked.push(id);
  }
  return picked;
}

/** Share of a topic's facts that are learned, 0..1. */
export function mastery(pool: readonly string[], stats: ReadonlyMap<string, FactStat>): number {
  if (pool.length === 0) return 0;
  return pool.filter((id) => isMastered(stats.get(id))).length / pool.length;
}

export function statsMap(facts: readonly FactStat[]): Map<string, FactStat> {
  return new Map(facts.map((f) => [f.factId, f]));
}
