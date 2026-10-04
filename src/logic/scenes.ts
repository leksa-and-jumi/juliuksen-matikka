import { FRAME_SIZE } from '../config';
import type { Bond, Cell, FramesScene } from './types';

/**
 * Fills ten-frames in reading order with the given runs of cells.
 * Example: fillFrames([['red', 8], ['blue', 2]]) → one full frame.
 */
export function fillFrames(runs: [Cell, number][], minFrames = 1): Cell[][] {
  const flat: Cell[] = runs.flatMap(([cell, count]) => Array<Cell>(Math.max(0, count)).fill(cell));
  const frameCount = Math.max(minFrames, Math.ceil(flat.length / FRAME_SIZE));
  const frames: Cell[][] = [];
  for (let f = 0; f < frameCount; f++) {
    const frame: Cell[] = [];
    for (let i = 0; i < FRAME_SIZE; i++) frame.push(flat[f * FRAME_SIZE + i] ?? 'empty');
    frames.push(frame);
  }
  return frames;
}

/** Builds a scene from one run list per frame (each frame filled separately). */
export function framesScene(
  perFrame: [Cell, number][][],
  extra: { numbered?: boolean; bond?: Bond } = {},
): FramesScene {
  return { kind: 'frames', frames: perFrame.map((runs) => fillFrames(runs)[0] ?? []), ...extra };
}

/** How many ten-frames are needed to show a number (at least one). */
export function framesFor(n: number): [Cell, number][][] {
  const full = Math.floor(n / FRAME_SIZE);
  const rest = n % FRAME_SIZE;
  const runs: [Cell, number][][] = Array.from({ length: full }, () => [['red', FRAME_SIZE]]);
  if (rest > 0 || full === 0) runs.push([['red', rest]]);
  return runs;
}

/** Counts counters of a colour across all frames. */
export function countCells(scene: FramesScene, cell: Cell): number {
  return scene.frames.flat().filter((c) => c === cell).length;
}
