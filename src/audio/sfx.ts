// Tiny sound effects made with code (no sound files needed).

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  if (!on) window.speechSynthesis?.cancel();
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface Note {
  freq: number;
  start: number;
  length: number;
  type?: OscillatorType;
  volume?: number;
}

function play(notes: Note[]): void {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  for (const n of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = n.type ?? 'triangle';
    osc.frequency.value = n.freq;
    const t0 = now + n.start;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(n.volume ?? 0.25, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.length);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + n.length + 0.05);
  }
}

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;

export const sfx = {
  tap: () => play([{ freq: 880, start: 0, length: 0.06, type: 'sine', volume: 0.12 }]),
  pop: (step = 0) =>
    play([{ freq: 520 + step * 45, start: 0, length: 0.09, type: 'sine', volume: 0.18 }]),
  correct: () =>
    play([
      { freq: E5, start: 0, length: 0.14 },
      { freq: G5, start: 0.1, length: 0.14 },
      { freq: C6, start: 0.2, length: 0.28 },
    ]),
  wrong: () =>
    play([
      { freq: 330, start: 0, length: 0.16, type: 'sine', volume: 0.18 },
      { freq: 262, start: 0.14, length: 0.24, type: 'sine', volume: 0.18 },
    ]),
  chomp: () =>
    play([
      { freq: 180, start: 0, length: 0.08, type: 'square', volume: 0.1 },
      { freq: 140, start: 0.12, length: 0.08, type: 'square', volume: 0.1 },
    ]),
  fanfare: () =>
    play([
      { freq: C5, start: 0, length: 0.16 },
      { freq: E5, start: 0.14, length: 0.16 },
      { freq: G5, start: 0.28, length: 0.16 },
      { freq: C6, start: 0.42, length: 0.5 },
      { freq: G5, start: 0.42, length: 0.5, volume: 0.15 },
    ]),
};
