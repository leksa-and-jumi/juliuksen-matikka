import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

const AVATAR_MAX_LENGTH = 16;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query('players').collect();
    return players.map((p) => ({ id: p._id, avatar: p.avatar, createdAt: p.createdAt }));
  },
});

export const create = mutation({
  args: { avatar: v.string() },
  handler: async (ctx, { avatar }) => {
    if (avatar.length === 0 || avatar.length > AVATAR_MAX_LENGTH) throw new Error('Bad avatar');
    const createdAt = Date.now();
    const id = await ctx.db.insert('players', { avatar, createdAt });
    return { id, avatar, createdAt };
  },
});
