import { motion } from 'motion/react';
import { SPIDER_HOP } from '../config';
import { FULL_WINDOW, cellOf, windowAround, windowNumbers } from '../logic/hundred';
import type { HundredScene } from '../logic/types';

const CELL = { full: 'clamp(27px, 7.8vw, 46px)', piece: 'clamp(52px, 14vw, 76px)' };
const TEXT = { full: 'text-[clamp(11px,2.7vw,17px)]', piece: 'text-[clamp(20px,5vw,30px)]' };
/** One cell is 10 units in the SVG overlay. */
const U = 10;

/** The 1–100 square (or a piece of it) with the spider hopping ten by ten. */
export function HundredGrid({ scene }: { scene: HundredScene }) {
  const { path, full } = scene;
  const win = full || path.length === 0 ? FULL_WINDOW : windowAround(path);
  const rows = windowNumbers(win);
  const nCols = win.toCol - win.fromCol + 1;
  const nRows = win.toRow - win.fromRow + 1;
  const size = full ? 'full' : 'piece';
  const start = path[0];
  const end = path.length > 1 ? path[path.length - 1] : undefined;

  const pos = (n: number) => {
    const { row, col } = cellOf(n);
    return { x: (col - win.fromCol) * U + U / 2, y: (row - win.fromRow) * U + U / 2 };
  };
  const pct = (n: number) => {
    const { x, y } = pos(n);
    return {
      left: `${((x - U * 0.28) / (nCols * U)) * 100}%`,
      top: `${((y - U * 0.26) / (nRows * U)) * 100}%`,
    };
  };
  const hops = path.slice(1).map((n, i) => ({ from: path[i] ?? n, to: n, i }));
  const spiderSpots = path.map(pct);

  return (
    <div
      key={`${path.join('-')}-${full}`}
      className="relative overflow-hidden rounded-2xl border-4 border-ink bg-white"
      role="img"
      aria-label={
        path.length > 1
          ? `Satataulu: hämähäkki hyppää ${path.join(', ')}`
          : 'Satataulu, luvut 1–100'
      }
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${nCols}, ${CELL[size]})` }}>
        {rows.flat().map((n) => {
          const inPath = path.includes(n);
          const bg =
            n === start
              ? 'bg-tomato-soft'
              : n === end
                ? 'bg-grass-soft'
                : inPath
                  ? 'bg-sky-soft'
                  : cellOf(n).row % 2 === 0
                    ? 'bg-white'
                    : 'bg-paper';
          return (
            <div
              key={n}
              className={`flex aspect-square items-center justify-center border border-ink/15 font-semibold tabular-nums ${TEXT[size]} ${bg} ${inPath ? 'font-bold' : 'text-ink/80'}`}
            >
              {scene.onesGlow && inPath && n >= 10 ? (
                <span>
                  {Math.floor(n / 10)}
                  <motion.span
                    className="rounded bg-sun px-px text-ink"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.35, 1] }}
                    transition={{ duration: 0.8, repeat: 2 }}
                  >
                    {n % 10}
                  </motion.span>
                </span>
              ) : (
                n
              )}
            </div>
          );
        })}
      </div>

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${nCols * U} ${nRows * U}`}
        aria-hidden
      >
        {hops.map(({ from, to, i }) => {
          const a = pos(from);
          const b = pos(to);
          const dir = Math.sign(b.y - a.y);
          const x = a.x + U * 0.3;
          const y1 = a.y + dir * U * 0.15;
          const y2 = b.y - dir * U * 0.15;
          const bulge = x + U * 0.42;
          const tip = `${x},${y2} ${x - U * 0.14},${y2 - dir * U * 0.2} ${x + U * 0.14},${y2 - dir * U * 0.2}`;
          return (
            <g key={i}>
              <motion.path
                d={`M ${x} ${y1} Q ${bulge} ${(y1 + y2) / 2} ${x} ${y2}`}
                fill="none"
                stroke="var(--color-sky)"
                strokeWidth={3.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: i * SPIDER_HOP, duration: SPIDER_HOP }}
              />
              <motion.polygon
                points={tip}
                fill="var(--color-sky)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (i + 1) * SPIDER_HOP }}
              />
            </g>
          );
        })}
      </svg>

      {spiderSpots.length > 0 && (
        <motion.div
          className="pointer-events-none absolute leading-none"
          style={{
            fontSize: full ? 'clamp(16px, 4.4vw, 28px)' : 'clamp(26px, 7vw, 40px)',
            translate: '-50% -50%',
          }}
          initial={{ left: spiderSpots[0]?.left, top: spiderSpots[0]?.top }}
          animate={{
            left: spiderSpots.map((s) => s.left),
            top: spiderSpots.map((s) => s.top),
            rotate: spiderSpots.length > 1 ? [0, -15, 15, 0] : 0,
          }}
          transition={{ duration: Math.max(0.01, SPIDER_HOP * (spiderSpots.length - 1)) }}
          aria-hidden
        >
          🕷️
        </motion.div>
      )}
    </div>
  );
}
