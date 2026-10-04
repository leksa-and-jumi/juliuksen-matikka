import { describe, expect, it } from 'vitest';
import { cellOf, jumpPath, windowAround, windowNumbers } from './hundred';

describe('hundred square', () => {
  it('finds the row and column of a number', () => {
    expect(cellOf(1)).toEqual({ row: 0, col: 0 });
    expect(cellOf(24)).toEqual({ row: 2, col: 3 });
    expect(cellOf(100)).toEqual({ row: 9, col: 9 });
  });

  it('jumps one row (10) at a time', () => {
    expect(jumpPath(24, 3)).toEqual([24, 34, 44, 54]);
    expect(jumpPath(54, -3)).toEqual([54, 44, 34, 24]);
  });

  it('shows a 3-column piece around the path like the worksheet', () => {
    const w = windowAround(jumpPath(24, 3));
    expect(windowNumbers(w)).toEqual([
      [23, 24, 25],
      [33, 34, 35],
      [43, 44, 45],
      [53, 54, 55],
    ]);
  });

  it('keeps the piece inside the square at the edges', () => {
    expect(windowNumbers(windowAround([10, 20]))[0]).toEqual([8, 9, 10]);
    expect(windowNumbers(windowAround([41, 31]))[0]).toEqual([31, 32, 33]);
  });
});
