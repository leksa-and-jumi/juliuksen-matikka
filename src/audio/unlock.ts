import { unlockAudio } from './sfx';
import { unlockSpeech } from './speech';

// Events that count as a real user gesture in every browser (touch uses pointerup/touchend).
const GESTURES = ['pointerup', 'touchend', 'keydown'] as const;

/** Unlocks sound effects and speech on the first tap or key press. */
export function unlockSoundOnFirstGesture(): void {
  const unlock = () => {
    unlockAudio();
    unlockSpeech();
    GESTURES.forEach((g) => window.removeEventListener(g, unlock, true));
  };
  GESTURES.forEach((g) => window.addEventListener(g, unlock, true));
}
