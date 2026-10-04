import { v } from 'convex/values';
import { nextBox } from '../src/logic/leitner';
import { mutation, query } from './_generated/server';

const MAX_STARS = 3;

export const get = query({
  args: { playerId: v.id('players') },
  handler: async (ctx, { playerId }) => {
    const [topics, facts, days] = await Promise.all([
      ctx.db
        .query('topicStats')
        .withIndex('by_player_key', (q) => q.eq('playerId', playerId))
        .collect(),
      ctx.db
        .query('facts')
        .withIndex('by_player_fact', (q) => q.eq('playerId', playerId))
        .collect(),
      ctx.db
        .query('days')
        .withIndex('by_player_day', (q) => q.eq('playerId', playerId))
        .collect(),
    ]);
    return {
      topics: topics.map(({ key, stars, bestScore, sessions }) => ({
        key,
        stars,
        bestScore,
        sessions,
      })),
      facts: facts.map(({ factId, topic, box, correct, wrong, lastSeen }) => ({
        factId,
        topic,
        box,
        correct,
        wrong,
        lastSeen,
      })),
      days: days.map(({ day, answers, correct }) => ({ day, answers, correct })),
    };
  },
});

export const recordAnswer = mutation({
  args: {
    playerId: v.id('players'),
    factId: v.string(),
    topic: v.string(),
    correct: v.boolean(),
    day: v.string(),
  },
  handler: async (ctx, { playerId, factId, topic, correct, day }) => {
    const now = Date.now();
    const fact = await ctx.db
      .query('facts')
      .withIndex('by_player_fact', (q) => q.eq('playerId', playerId).eq('factId', factId))
      .unique();
    if (fact) {
      await ctx.db.patch(fact._id, {
        box: nextBox(fact.box, correct),
        correct: fact.correct + (correct ? 1 : 0),
        wrong: fact.wrong + (correct ? 0 : 1),
        lastSeen: now,
      });
    } else {
      await ctx.db.insert('facts', {
        playerId,
        factId,
        topic,
        box: nextBox(0, correct),
        correct: correct ? 1 : 0,
        wrong: correct ? 0 : 1,
        lastSeen: now,
      });
    }

    const dayRow = await ctx.db
      .query('days')
      .withIndex('by_player_day', (q) => q.eq('playerId', playerId).eq('day', day))
      .unique();
    if (dayRow) {
      await ctx.db.patch(dayRow._id, {
        answers: dayRow.answers + 1,
        correct: dayRow.correct + (correct ? 1 : 0),
      });
    } else {
      await ctx.db.insert('days', { playerId, day, answers: 1, correct: correct ? 1 : 0 });
    }
  },
});

export const finishSession = mutation({
  args: {
    playerId: v.id('players'),
    key: v.string(),
    score: v.number(),
    total: v.number(),
    stars: v.number(),
  },
  handler: async (ctx, { playerId, key, score, stars }) => {
    const safeStars = Math.max(0, Math.min(MAX_STARS, Math.round(stars)));
    const row = await ctx.db
      .query('topicStats')
      .withIndex('by_player_key', (q) => q.eq('playerId', playerId).eq('key', key))
      .unique();
    if (row) {
      await ctx.db.patch(row._id, {
        stars: Math.max(row.stars, safeStars),
        bestScore: Math.max(row.bestScore, score),
        sessions: row.sessions + 1,
      });
    } else {
      await ctx.db.insert('topicStats', {
        playerId,
        key,
        stars: safeStars,
        bestScore: score,
        sessions: 1,
      });
    }
  },
});
