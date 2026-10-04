import { HUNDRED_COLS, HUNDRED_MAX } from '../config';

/** Row and column (0-based) of a number in the 1–100 square. */
export function cellOf(n: number): { row: number; col: number } {
  return { row: Math.floor((n - 1) / HUNDRED_COLS), col: (n - 1) % HUNDRED_COLS };
}

/** Numbers the spider lands on: start, then one row (±10) per jump. */
export function jumpPath(start: number, jumps: number): number[] {
  const step = Math.sign(jumps) * HUNDRED_COLS;
  return Array.from({ length: Math.abs(jumps) + 1 }, (_, i) => start + i * step);
}

export function isOnSquare(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= HUNDRED_MAX;
}

export interface GridWindow {
  fromRow: number;
  toRow: number;
  fromCol: number;
  toCol: number;
}

/** The whole square. */
export const FULL_WINDOW: GridWindow = {
  fromRow: 0,
  toRow: HUNDRED_MAX / HUNDRED_COLS - 1,
  fromCol: 0,
  toCol: HUNDRED_COLS - 1,
};

/**
 * A small piece of the square around the path, like on the school worksheet:
 * the path's column with one neighbour on each side, rows from start to end.
 */
export function windowAround(path: number[]): GridWindow {
  const cells = path.map(cellOf);
  const rows = cells.map((c) => c.row);
  const col = cells[0]?.col ?? 0;
  const fromCol = Math.max(0, Math.min(col - 1, HUNDRED_COLS - 3));
  return {
    fromRow: Math.min(...rows),
    toRow: Math.max(...rows),
    fromCol,
    toCol: fromCol + 2,
  };
}

/** All numbers inside a window, row by row. */
export function windowNumbers(w: GridWindow): number[][] {
  const rows: number[][] = [];
  for (let r = w.fromRow; r <= w.toRow; r++) {
    const row: number[] = [];
    for (let c = w.fromCol; c <= w.toCol; c++) row.push(r * HUNDRED_COLS + c + 1);
    rows.push(row);
  }
  return rows;
}
