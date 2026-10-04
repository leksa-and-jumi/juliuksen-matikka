import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// No names or personal data: a player is just an animal avatar.
export default defineSchema({
  players: defineTable({
    avatar: v.string(),
    createdAt: v.number(),
  }),
  topicStats: defineTable({
    playerId: v.id('players'),
    key: v.string(),
    stars: v.number(),
    bestScore: v.number(),
    sessions: v.number(),
  }).index('by_player_key', ['playerId', 'key']),
  facts: defineTable({
    playerId: v.id('players'),
    factId: v.string(),
    topic: v.string(),
    box: v.number(),
    correct: v.number(),
    wrong: v.number(),
    lastSeen: v.number(),
  }).index('by_player_fact', ['playerId', 'factId']),
  days: defineTable({
    playerId: v.id('players'),
    day: v.string(),
    answers: v.number(),
    correct: v.number(),
  }).index('by_player_day', ['playerId', 'day']),
});
