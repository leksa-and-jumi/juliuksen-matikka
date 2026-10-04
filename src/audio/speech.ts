// Reads texts aloud in Finnish, so Julius does not need to read everything himself.

let speechOn = true;

export function setSpeechEnabled(on: boolean): void {
  speechOn = on;
  if (!on) window.speechSynthesis?.cancel();
}

function finnishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return voices.find((v) => v.lang.toLowerCase().startsWith('fi'));
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Speaks the text, stopping anything that was being said. */
export function speak(text: string, force = false): void {
  if ((!speechOn && !force) || !canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  // Math symbols read nicer as words.
  const clean = text.replaceAll('−', ' miinus ').replaceAll('+', ' plus ');
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'fi-FI';
  utterance.rate = 0.92;
  utterance.pitch = 1.1;
  const voice = finnishVoice();
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
