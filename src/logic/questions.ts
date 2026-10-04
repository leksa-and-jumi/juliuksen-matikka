import { COMPARE_MAX, FRAME_SIZE } from '../config';
import { framesScene } from './scenes';
import { TOPICS } from './topics';
import type { CompareSign, ExplainStep, Question, ScaffoldStep, TopicId } from './types';

export const MINUS = '−';

export function factId(topic: TopicId, a: number, b: number): string {
  return `${topic}:${a}:${b}`;
}

export function parseFactId(id: string): { topic: TopicId; a: number; b: number } | null {
  const [topic, a, b] = id.split(':');
  if (!TOPICS.some((t) => t.id === topic)) return null;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isInteger(na) || !Number.isInteger(nb)) return null;
  return { topic: topic as TopicId, a: na, b: nb };
}

export function compareSign(a: number, b: number): CompareSign {
  if (a < b) return '<';
  if (a > b) return '>';
  return '=';
}

/** Every fact (number pair) that belongs to a topic. */
export function allFacts(topic: TopicId): string[] {
  const pairs: [number, number][] = [];
  switch (topic) {
    case 'compare':
      for (let a = 0; a <= COMPARE_MAX; a++)
        for (let b = 0; b <= COMPARE_MAX; b++) pairs.push([a, b]);
      break;
    case 'add10':
      for (let a = 1; a < FRAME_SIZE; a++)
        for (let b = 1; a + b <= FRAME_SIZE; b++) pairs.push([a, b]);
      break;
    case 'sub10':
      for (let a = 1; a <= FRAME_SIZE; a++) for (let b = 1; b <= a; b++) pairs.push([a, b]);
      break;
    case 'pairs10':
      for (let a = 1; a < FRAME_SIZE; a++) pairs.push([a, FRAME_SIZE - a]);
      break;
    case 'bridgeAdd':
      for (let a = 2; a < FRAME_SIZE; a++)
        for (let b = 2; b < FRAME_SIZE; b++) if (a + b > FRAME_SIZE) pairs.push([a, b]);
      break;
    case 'bridgeSub':
      for (let a = FRAME_SIZE + 1; a < 2 * FRAME_SIZE; a++)
        for (let b = 2; b < FRAME_SIZE; b++)
          if (a - b < FRAME_SIZE && a - b > 0) pairs.push([a, b]);
      break;
  }
  return pairs.map(([a, b]) => factId(topic, a, b));
}

/** Bridging ten: 8 + 5 → need 2 to fill the ten, 3 go to the next ten. */
export function splitForAdd(a: number, b: number): { need: number; rest: number } {
  const need = FRAME_SIZE - a;
  return { need, rest: b - need };
}

/** Bridging ten backwards: 13 − 5 → take 3 to reach ten, then 2 more. */
export function splitForSub(a: number, b: number): { ones: number; rest: number } {
  const ones = a - FRAME_SIZE;
  return { ones, rest: b - ones };
}

export function makeQuestion(topic: TopicId, a: number, b: number): Question {
  const base = { factId: factId(topic, a, b), topic, a, b };
  switch (topic) {
    case 'compare':
      return {
        ...base,
        tokens: [`${a}`, '?', `${b}`],
        answer: compareSign(a, b),
        say: `Kumpi on suurempi, ${a} vai ${b}? Valitse oikea merkki.`,
        scene: { kind: 'compare', left: a, right: b, croc: 'hidden' },
      };
    case 'add10':
      return {
        ...base,
        tokens: [`${a}`, '+', `${b}`, '=', '?'],
        answer: a + b,
        say: `${a} plus ${b} on?`,
        scene: framesScene([
          [
            ['red', a],
            ['blue', b],
          ],
        ]),
      };
    case 'sub10':
      return {
        ...base,
        tokens: [`${a}`, MINUS, `${b}`, '=', '?'],
        answer: a - b,
        say: `${a} miinus ${b} on?`,
        scene: framesScene([
          [
            ['red', a - b],
            ['gone', b],
          ],
        ]),
      };
    case 'pairs10':
      return {
        ...base,
        tokens: [`${a}`, '+', '?', '=', `${FRAME_SIZE}`],
        answer: FRAME_SIZE - a,
        say: `${a} plus mikä on kymmenen?`,
        scene: framesScene([[['red', a]]]),
      };
    case 'bridgeAdd':
      return {
        ...base,
        tokens: [`${a}`, '+', `${b}`, '=', '?'],
        answer: a + b,
        say: `${a} plus ${b} on?`,
        scene: bridgeAddScene(a, b, 'done'),
        steps: bridgeAddSteps(a, b),
      };
    case 'bridgeSub':
      return {
        ...base,
        tokens: [`${a}`, MINUS, `${b}`, '=', '?'],
        answer: a - b,
        say: `${a} miinus ${b} on?`,
        scene: bridgeSubScene(a, b, 'done'),
        steps: bridgeSubSteps(a, b),
      };
  }
}

export function questionFromFact(id: string): Question | null {
  const parsed = parseFactId(id);
  return parsed ? makeQuestion(parsed.topic, parsed.a, parsed.b) : null;
}

type BridgeStage = 'start' | 'fill' | 'split' | 'done';

function bridgeAddScene(a: number, b: number, stage: BridgeStage) {
  const { need, rest } = splitForAdd(a, b);
  switch (stage) {
    case 'start':
      return framesScene([[['red', a]], []]);
    case 'fill':
      return framesScene(
        [
          [
            ['red', a],
            ['hint', need],
          ],
          [],
        ],
        { bond: { whole: b, left: need, right: '?' } },
      );
    case 'split':
      return framesScene(
        [
          [
            ['red', a],
            ['blue', need],
          ],
          [],
        ],
        { bond: { whole: b, left: need, right: rest } },
      );
    case 'done':
      return framesScene(
        [
          [
            ['red', a],
            ['blue', need],
          ],
          [['blue', rest]],
        ],
        { bond: { whole: b, left: need, right: rest } },
      );
  }
}

function bridgeSubScene(a: number, b: number, stage: BridgeStage) {
  const { ones, rest } = splitForSub(a, b);
  switch (stage) {
    case 'start':
      return framesScene([[['red', FRAME_SIZE]], [['red', ones]]]);
    case 'fill':
      return framesScene([[['red', FRAME_SIZE]], [['gone', ones]]], {
        bond: { whole: b, left: ones, right: '?' },
      });
    case 'split':
      return framesScene([[['red', FRAME_SIZE]], [['gone', ones]]], {
        bond: { whole: b, left: ones, right: rest },
      });
    case 'done':
      return framesScene(
        [
          [
            ['red', FRAME_SIZE - rest],
            ['gone', rest],
          ],
          [['gone', ones]],
        ],
        { bond: { whole: b, left: ones, right: rest } },
      );
  }
}

function bridgeAddSteps(a: number, b: number): ScaffoldStep[] {
  const { need, rest } = splitForAdd(a, b);
  return [
    {
      tokens: [`${a}`, '+', '?', '=', '10'],
      answer: need,
      say: `Montako puuttuu kympistä? ${a} plus mikä on kymmenen?`,
      hint: 'Montako tyhjää paikkaa kymppiruudussa on?',
      scene: { ...bridgeAddScene(a, b, 'fill'), bond: undefined },
    },
    {
      tokens: [`${b}`, '=', `${need}`, '+', '?'],
      answer: rest,
      say: `Pilkotaan ${b}. ${b} on ${need} ja mikä?`,
      hint: `Kymppiin meni ${need}. Montako jää yli?`,
      scene: { ...bridgeAddScene(a, b, 'split'), bond: { whole: b, left: need, right: '?' } },
    },
    {
      tokens: ['10', '+', `${rest}`, '=', '?'],
      answer: a + b,
      say: `Kymmenen plus ${rest} on?`,
      hint: 'Täysi kymppi ja loput yhteen!',
      scene: bridgeAddScene(a, b, 'done'),
    },
  ];
}

function bridgeSubSteps(a: number, b: number): ScaffoldStep[] {
  const { ones, rest } = splitForSub(a, b);
  return [
    {
      tokens: [`${a}`, MINUS, '?', '=', '10'],
      answer: ones,
      say: `Montako pitää ottaa pois, että päästään kymppiin? ${a} miinus mikä on kymmenen?`,
      hint: 'Montako palloa on kympin yli?',
      scene: bridgeSubScene(a, b, 'start'),
    },
    {
      tokens: [`${b}`, '=', `${ones}`, '+', '?'],
      answer: rest,
      say: `Pilkotaan ${b}. ${b} on ${ones} ja mikä?`,
      hint: `${ones} otettiin jo pois. Montako pitää vielä ottaa?`,
      scene: bridgeSubScene(a, b, 'fill'),
    },
    {
      tokens: ['10', MINUS, `${rest}`, '=', '?'],
      answer: a - b,
      say: `Kymmenen miinus ${rest} on?`,
      hint: 'Ota täydestä kympistä loput pois!',
      scene: bridgeSubScene(a, b, 'done'),
    },
  ];
}

/** Step-by-step animated explanation for one question. */
export function explain(q: Question): ExplainStep[] {
  const { a, b } = q;
  switch (q.topic) {
    case 'compare': {
      const sign = compareSign(a, b);
      const scene = { kind: 'compare' as const, left: a, right: b };
      const bigger = Math.max(a, b);
      const smaller = Math.min(a, b);
      const sentence =
        sign === '<'
          ? `${a} on pienempi kuin ${b}.`
          : sign === '>'
            ? `${a} on suurempi kuin ${b}.`
            : `${a} on yhtä suuri kuin ${b}.`;
      return [
        {
          text: `Kumpi on suurempi: ${a} vai ${b}?`,
          tokens: [`${a}`, '?', `${b}`],
          scene: { ...scene, croc: 'hidden' },
        },
        sign === '='
          ? {
              text: 'Katso palloja. Molemmilla puolilla on yhtä monta!',
              tokens: [`${a}`, '?', `${b}`],
              scene: { ...scene, croc: 'hungry', glow: 'both' },
            }
          : {
              text: `Katso palloja. ${bigger} on enemmän kuin ${smaller}!`,
              tokens: [`${a}`, '?', `${b}`],
              scene: { ...scene, croc: 'hungry', glow: a > b ? 'left' : 'right' },
            },
        sign === '='
          ? {
              text: 'Krokotiili ei osaa valita! Kun luvut ovat yhtä suuret, väliin tulee yhtäsuuruusmerkki.',
              tokens: [`${a}`, '=', `${b}`],
              highlight: 1,
              scene: { ...scene, croc: '=', glow: 'both' },
            }
          : {
              text: `Nälkäinen krokotiili avaa suunsa aina suurempaa kohti. Ham! Se syö luvun ${bigger}!`,
              tokens: [`${a}`, sign, `${b}`],
              highlight: 1,
              scene: { ...scene, croc: sign, glow: a > b ? 'left' : 'right' },
            },
        {
          text:
            sign === '='
              ? `Luetaan: ${sentence}`
              : `Terävä kärki osoittaa pienempää. Luetaan: ${sentence}`,
          tokens: [`${a}`, sign, `${b}`],
          highlight: 1,
          scene: { ...scene, croc: sign },
        },
      ];
    }
    case 'add10':
      return [
        {
          text: `Tässä on ${a} punaista palloa.`,
          tokens: [`${a}`, '+', `${b}`, '=', '?'],
          highlight: 0,
          scene: framesScene([[['red', a]]]),
        },
        {
          text: `Plus tarkoittaa: lisää! Lisätään ${b} sinistä.`,
          tokens: [`${a}`, '+', `${b}`, '=', '?'],
          highlight: 2,
          scene: framesScene([
            [
              ['red', a],
              ['blue', b],
            ],
          ]),
        },
        {
          text: 'Lasketaan kaikki pallot yhdessä!',
          tokens: [`${a}`, '+', `${b}`, '=', '?'],
          scene: framesScene(
            [
              [
                ['red', a],
                ['blue', b],
              ],
            ],
            { numbered: true },
          ),
        },
        {
          text: `Palloja on yhteensä ${a + b}. ${a} plus ${b} on ${a + b}!`,
          tokens: [`${a}`, '+', `${b}`, '=', `${a + b}`],
          highlight: 4,
          scene: framesScene(
            [
              [
                ['red', a],
                ['blue', b],
              ],
            ],
            { numbered: true },
          ),
        },
      ];
    case 'sub10':
      return [
        {
          text: `Tässä on ${a} palloa.`,
          tokens: [`${a}`, MINUS, `${b}`, '=', '?'],
          highlight: 0,
          scene: framesScene([[['red', a]]]),
        },
        {
          text: `Miinus tarkoittaa: ota pois! Otetaan ${b} pois. Hei hei!`,
          tokens: [`${a}`, MINUS, `${b}`, '=', '?'],
          highlight: 2,
          scene: framesScene([
            [
              ['red', a - b],
              ['gone', b],
            ],
          ]),
        },
        {
          text: 'Lasketaan, montako jäi jäljelle.',
          tokens: [`${a}`, MINUS, `${b}`, '=', '?'],
          scene: framesScene(
            [
              [
                ['red', a - b],
                ['gone', b],
              ],
            ],
            { numbered: true },
          ),
        },
        {
          text:
            a - b === 0
              ? `Yhtään ei jäänyt! ${a} miinus ${b} on nolla.`
              : `Jäljelle jäi ${a - b}. ${a} miinus ${b} on ${a - b}!`,
          tokens: [`${a}`, MINUS, `${b}`, '=', `${a - b}`],
          highlight: 4,
          scene: framesScene(
            [
              [
                ['red', a - b],
                ['gone', b],
              ],
            ],
            { numbered: true },
          ),
        },
      ];
    case 'pairs10': {
      const other = FRAME_SIZE - a;
      return [
        {
          text: `Kymppiruudussa on 10 paikkaa. Tässä on ${a} palloa.`,
          tokens: [`${a}`, '+', '?', '=', '10'],
          highlight: 0,
          scene: framesScene([[['red', a]]]),
        },
        {
          text: 'Montako paikkaa on vielä tyhjänä?',
          tokens: [`${a}`, '+', '?', '=', '10'],
          highlight: 2,
          scene: framesScene([
            [
              ['red', a],
              ['hint', other],
            ],
          ]),
        },
        {
          text: `Täytetään tyhjät paikat: tarvitaan ${other}!`,
          tokens: [`${a}`, '+', `${other}`, '=', '10'],
          highlight: 2,
          scene: framesScene(
            [
              [
                ['red', a],
                ['blue', other],
              ],
            ],
            { bond: { whole: 10, left: a, right: other } },
          ),
        },
        {
          text: `${a} ja ${other} ovat kymppikaverit! Yhdessä ne tekevät kympin.`,
          tokens: [`${a}`, '+', `${other}`, '=', '10'],
          highlight: 4,
          scene: framesScene(
            [
              [
                ['red', a],
                ['blue', other],
              ],
            ],
            { numbered: true, bond: { whole: 10, left: a, right: other } },
          ),
        },
      ];
    }
    case 'bridgeAdd': {
      const { need, rest } = splitForAdd(a, b);
      const sum = a + b;
      return [
        {
          text: `Lasketaan ${a} plus ${b}. Laitetaan ensin ${a} punaista kymppiruutuun.`,
          tokens: [`${a}`, '+', `${b}`, '=', '?'],
          highlight: 0,
          scene: bridgeAddScene(a, b, 'start'),
        },
        {
          text: `Temppu: täytetään ensin kymppi! Kympistä puuttuu ${need}.`,
          tokens: [`${a}`, '+', `${need}`, '=', '10'],
          highlight: 2,
          scene: { ...bridgeAddScene(a, b, 'fill'), bond: undefined },
        },
        {
          text: `Pilkotaan ${b} kahteen osaan: ${need} ja ${rest}.`,
          tokens: [`${b}`, '=', `${need}`, '+', `${rest}`],
          scene: bridgeAddScene(a, b, 'split'),
        },
        {
          text: `${need} täyttää kympin. Loput ${rest} menevät seuraavaan ruutuun.`,
          tokens: ['10', '+', `${rest}`, '=', `${sum}`],
          highlight: 2,
          scene: bridgeAddScene(a, b, 'done'),
        },
        {
          text: `Täysi kymppi ja ${rest} lisää on ${sum}. Siis ${a} plus ${b} on ${sum}!`,
          tokens: [`${a}`, '+', `${b}`, '=', `${sum}`],
          highlight: 4,
          scene: { ...bridgeAddScene(a, b, 'done'), numbered: true },
        },
      ];
    }
    case 'bridgeSub': {
      const { ones, rest } = splitForSub(a, b);
      const diff = a - b;
      return [
        {
          text: `Lasketaan ${a} miinus ${b}. ${a} on täysi kymppi ja ${ones} lisää.`,
          tokens: [`${a}`, MINUS, `${b}`, '=', '?'],
          highlight: 0,
          scene: bridgeSubScene(a, b, 'start'),
        },
        {
          text: `Temppu: mennään ensin tasan kymppiin! Otetaan pois ${ones}.`,
          tokens: [`${a}`, MINUS, `${ones}`, '=', '10'],
          highlight: 2,
          scene: { ...bridgeSubScene(a, b, 'fill'), bond: undefined },
        },
        {
          text: `Pilkotaan ${b} kahteen osaan: ${ones} ja ${rest}. Vielä ${rest} pitää ottaa pois.`,
          tokens: [`${b}`, '=', `${ones}`, '+', `${rest}`],
          scene: bridgeSubScene(a, b, 'split'),
        },
        {
          text: `Otetaan täydestä kympistä ${rest} pois.`,
          tokens: ['10', MINUS, `${rest}`, '=', `${diff}`],
          highlight: 2,
          scene: bridgeSubScene(a, b, 'done'),
        },
        {
          text: `Jäljelle jäi ${diff}. Siis ${a} miinus ${b} on ${diff}!`,
          tokens: [`${a}`, MINUS, `${b}`, '=', `${diff}`],
          highlight: 4,
          scene: { ...bridgeSubScene(a, b, 'done'), numbered: true },
        },
      ];
    }
  }
}

/** Turns equation tokens into words for speech. */
export function tokensToSpeech(tokens: string[]): string {
  const arithmetic = tokens.includes('+') || tokens.includes(MINUS);
  const words: Record<string, string> = {
    '+': 'plus',
    [MINUS]: 'miinus',
    '=': arithmetic ? 'on' : 'on yhtä suuri kuin',
    '<': 'on pienempi kuin',
    '>': 'on suurempi kuin',
    '?': 'mikä',
  };
  return tokens.map((t) => words[t] ?? t).join(' ');
}

/** Short label of a fact for lists, e.g. "8 + 5" or "3 ○ 7". */
export function factLabel(id: string): string {
  const q = questionFromFact(id);
  if (!q) return id;
  if (q.topic === 'compare') return `${q.a} ○ ${q.b}`;
  if (q.topic === 'pairs10') return `${q.a} + ? = 10`;
  return q.tokens.slice(0, 3).join(' ');
}
