export type TopicId = 'compare' | 'add10' | 'sub10' | 'pairs10' | 'bridgeAdd' | 'bridgeSub';

/** practice = pictures and steps help, challenge = answer on your own. */
export type Mode = 'practice' | 'challenge';

export type CompareSign = '<' | '>' | '=';
export type Answer = number | CompareSign;

/** One slot of a ten-frame. red = first number, blue = second, gone = taken away, hint = glowing empty slot. */
export type Cell = 'empty' | 'red' | 'blue' | 'gone' | 'hint';

export type BondValue = number | '?';

/** Number bond: a whole split into two parts. */
export interface Bond {
  whole: BondValue;
  left: BondValue;
  right: BondValue;
}

export interface FramesScene {
  kind: 'frames';
  frames: Cell[][];
  /** Show running count numbers on the counters. */
  numbered?: boolean;
  bond?: Bond;
}

export type CrocState = 'hidden' | 'hungry' | CompareSign;

export interface CompareScene {
  kind: 'compare';
  left: number;
  right: number;
  croc: CrocState;
  glow?: 'left' | 'right' | 'both';
}

export type Scene = FramesScene | CompareScene;

/** Equation tokens. '?' is the blank the child fills in. */
export type Token = string;

export interface ExplainStep {
  text: string;
  tokens: Token[];
  scene: Scene;
  /** Index of the token to highlight. */
  highlight?: number;
}

/** One small sub-question when a bridging-ten problem is solved step by step. */
export interface ScaffoldStep {
  tokens: Token[];
  answer: number;
  say: string;
  hint: string;
  scene: Scene;
}

export interface Question {
  factId: string;
  topic: TopicId;
  a: number;
  b: number;
  tokens: Token[];
  answer: Answer;
  say: string;
  scene: Scene;
  steps?: ScaffoldStep[];
}

export interface FactStat {
  factId: string;
  topic: TopicId;
  box: number;
  correct: number;
  wrong: number;
  lastSeen: number;
}

export interface TopicStat {
  /** `${topic}:${mode}` or `daily:practice`. */
  key: string;
  stars: number;
  bestScore: number;
  sessions: number;
}

export interface DayStat {
  /** Local date YYYY-MM-DD. */
  day: string;
  answers: number;
  correct: number;
}

export interface Progress {
  topics: TopicStat[];
  facts: FactStat[];
  days: DayStat[];
}

export interface Player {
  id: string;
  avatar: string;
  createdAt: number;
}

export type Rng = () => number;
