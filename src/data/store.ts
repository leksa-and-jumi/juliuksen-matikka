import type { AnswerInput, SessionResult } from '../logic/progress';
import type { Player, Progress } from '../logic/types';

/** Where progress is saved: Convex (all devices) or this browser only. */
export interface ProgressStore {
  readonly kind: 'convex' | 'local';
  listPlayers(): Promise<Player[]>;
  createPlayer(avatar: string): Promise<Player>;
  getProgress(playerId: string): Promise<Progress>;
  recordAnswer(playerId: string, input: AnswerInput): Promise<void>;
  finishSession(playerId: string, result: SessionResult): Promise<void>;
}
