// Reads texts aloud in Finnish, so Julius does not need to read everything himself.

import { PREFERRED_VOICE, SPEECH_RESTART_MS } from '../config';

let speechOn = true;
let voice: SpeechSynthesisVoice | undefined;
let timer = 0;

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Voices load asynchronously: the first getVoices() call is often empty. */
function loadVoices(): void {
  const fi = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('fi'));
  voice = fi.find((v) => v.name.startsWith(PREFERRED_VOICE)) ?? fi[0];
}

if (canSpeak()) {
  loadVoices();
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
}

export function setSpeechEnabled(on: boolean): void {
  speechOn = on;
  if (!on) stopSpeaking();
}

function utter(text: string, volume = 1): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fi-FI';
  u.rate = 0.92;
  u.pitch = 1.1;
  u.volume = volume;
  if (voice) u.voice = voice;
  return u;
}

/** Speaks the text, stopping anything that was being said. */
export function speak(text: string, force = false): void {
  if ((!speechOn && !force) || !canSpeak()) return;
  const synth = window.speechSynthesis;
  window.clearTimeout(timer);
  // Math symbols read nicer as words.
  const u = utter(text.replaceAll('−', ' miinus ').replaceAll('+', ' plus '));
  const start = () => {
    // Chrome can get stuck "paused"; resume() wakes it up.
    synth.resume();
    synth.speak(u);
  };
  if (synth.speaking || synth.pending) {
    synth.cancel();
    timer = window.setTimeout(start, SPEECH_RESTART_MS);
  } else {
    start();
  }
}

export function stopSpeaking(): void {
  if (!canSpeak()) return;
  window.clearTimeout(timer);
  window.speechSynthesis.cancel();
}

/**
 * iPad and iPhone only allow speech that starts from a tap. Speaking a silent
 * utterance on the first tap unlocks it for the automatic reading later.
 */
export function unlockSpeech(): void {
  if (!canSpeak()) return;
  loadVoices();
  window.speechSynthesis.speak(utter(' ', 0));
}
