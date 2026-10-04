import { ConvexClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { isTopicId } from '../logic/topics';
import type { FactStat, Progress } from '../logic/types';
import type { ProgressStore } from './store';

const asPlayerId = (id: string) => id as Id<'players'>;

/** Saves progress in Convex so it follows the player to every device. */
export function createConvexStore(url: string): ProgressStore {
  const client = new ConvexClient(url);
  return {
    kind: 'convex',
    listPlayers() {
      return client.query(api.players.list, {});
    },
    createPlayer(avatar) {
      return client.mutation(api.players.create, { avatar });
    },
    async getProgress(playerId) {
      const raw = await client.query(api.progress.get, { playerId: asPlayerId(playerId) });
      const facts: FactStat[] = raw.facts.flatMap((f) =>
        isTopicId(f.topic) ? [{ ...f, topic: f.topic }] : [],
      );
      const progress: Progress = { topics: raw.topics, facts, days: raw.days };
      return progress;
    },
    async recordAnswer(playerId, { factId, topic, correct, day }) {
      await client.mutation(api.progress.recordAnswer, {
        playerId: asPlayerId(playerId),
        factId,
        topic,
        correct,
        day,
      });
    },
    async finishSession(playerId, result) {
      await client.mutation(api.progress.finishSession, {
        playerId: asPlayerId(playerId),
        ...result,
      });
    },
  };
}
