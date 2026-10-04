import { STORAGE_KEY } from '../config';
import { EMPTY_PROGRESS, applyAnswer, applySession } from '../logic/progress';
import type { Player, Progress } from '../logic/types';
import type { ProgressStore } from './store';

interface Saved {
  players: Player[];
  progress: Record<string, Progress>;
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Saved;
  } catch {
    // Storage blocked or broken: start fresh.
  }
  return { players: [], progress: {} };
}

function save(data: Saved): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked: progress lives only in memory this time.
  }
}

/** Saves progress in this browser only. Used when Convex is not configured. */
export function createLocalStore(): ProgressStore {
  return {
    kind: 'local',
    async listPlayers() {
      return load().players;
    },
    async createPlayer(avatar) {
      const data = load();
      const player: Player = { id: crypto.randomUUID(), avatar, createdAt: Date.now() };
      save({ ...data, players: [...data.players, player] });
      return player;
    },
    async getProgress(playerId) {
      return load().progress[playerId] ?? EMPTY_PROGRESS;
    },
    async recordAnswer(playerId, input) {
      const data = load();
      const progress = applyAnswer(data.progress[playerId] ?? EMPTY_PROGRESS, input);
      save({ ...data, progress: { ...data.progress, [playerId]: progress } });
    },
    async finishSession(playerId, result) {
      const data = load();
      const progress = applySession(data.progress[playerId] ?? EMPTY_PROGRESS, result);
      save({ ...data, progress: { ...data.progress, [playerId]: progress } });
    },
  };
}
