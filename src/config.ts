// All tunable numbers live here. No magic numbers elsewhere.

/** Questions in one practice round (wrong answers are repeated on top of this). */
export const SESSION_LENGTH = 10;

/** Slots in one ten-frame. */
export const FRAME_SIZE = 10;

/** Biggest number used in the "bigger or smaller" topic. */
export const COMPARE_MAX = 20;

/** Leitner boxes: 1 = still learning, 5 = knows it by heart. */
export const MIN_BOX = 1;
export const MAX_BOX = 5;
/** A fact counts as "learned" from this box upwards. */
export const MASTERED_BOX = 3;

/** How often an unseen fact is picked compared to box weights below. */
export const UNSEEN_WEIGHT = 4;
/** Weight per Leitner box (index = box). Lower box = asked more often. */
export const BOX_WEIGHTS = [0, 8, 5, 3, 1.5, 1] as const;
/** In the daily mix, weak facts matter more and new facts less. */
export const DAILY_UNSEEN_WEIGHT = 1;
/** Equal pairs are rare among all pairs; boost them so "=" gets practised. */
export const COMPARE_EQUAL_BOOST = 6;

/** Stars: finishing gives 1, this share right on first try gives 2, all right gives 3. */
export const TWO_STAR_SHARE = 0.8;

/** Correct answers in a row that trigger a streak cheer. */
export const STREAK_CHEER = 3;

/** Animation timings in seconds. */
export const COUNTER_STAGGER = 0.09;
export const COUNT_STAGGER = 0.38;
export const FEEDBACK_DELAY_MS = 900;

/** Local storage keys. */
export const STORAGE_KEY = 'juliuksen-matikka:v1';
export const PLAYER_KEY = 'juliuksen-matikka:player';
export const SOUND_KEY = 'juliuksen-matikka:sound';

/** Days shown in the grown-ups' activity strip. */
export const PARENT_DAYS = 14;
/** Weak facts listed for grown-ups. */
export const PARENT_WEAK_FACTS = 12;

/** Players are animals: no names or other personal data needed. */
export const AVATARS = [
  { emoji: '🦊', name: 'Kettu' },
  { emoji: '🐻', name: 'Karhu' },
  { emoji: '🦖', name: 'Dino' },
  { emoji: '🐼', name: 'Panda' },
  { emoji: '🦁', name: 'Leijona' },
  { emoji: '🐸', name: 'Sammakko' },
  { emoji: '🐙', name: 'Mustekala' },
  { emoji: '🦄', name: 'Yksisarvinen' },
  { emoji: '🐧', name: 'Pingviini' },
  { emoji: '🐯', name: 'Tiikeri' },
] as const;

/** Wait after cancelling speech before speaking again (Chrome drops it otherwise). */
export const SPEECH_RESTART_MS = 80;
/** Preferred Finnish voice (macOS and iOS); any fi-* voice is used otherwise. */
export const PREFERRED_VOICE = 'Satu';

/** Hundred square (1–100) and the spider's jumps on it. */
export const HUNDRED_MAX = 100;
export const HUNDRED_COLS = 10;
export const HUNDRED_MAX_JUMPS = 5;
/** Seconds per spider hop. */
export const SPIDER_HOP = 0.55;

/** Fireworks at the end of a round. Distances in CSS pixels, time in seconds. */
export const FIREWORKS_MS = 4500;
export const FIREWORKS_MS_THREE_STARS = 8000;
export const FIREWORK_LAUNCH_EVERY_MS = 420;
export const FIREWORK_GRAVITY = 260;
export const FIREWORK_SPARKS = 90;
export const FIREWORK_SPARK_SPEED = 360;
export const FIREWORK_SPARK_LIFE = 1.4;
export const FIREWORK_DRAG = 0.985;
export const FIREWORK_COLORS = [
  '#ff4d5e',
  '#2d7dff',
  '#22c06a',
  '#ffd23f',
  '#8c52ff',
  '#ff5fa8',
  '#ff8a1f',
  '#10b3a8',
] as const;
