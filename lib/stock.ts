import { redis } from "./redis";

export const stock = {
  async toggle(userId: string, contentId: string): Promise<boolean> {
    const raw = await redis.get<string[]>(`user:${userId}:stocks`);
    const stocks: string[] = raw ?? [];
    const idx = stocks.indexOf(contentId);
    if (idx >= 0) {
      stocks.splice(idx, 1);
      await redis.set(`user:${userId}:stocks`, stocks);
      return false;
    }
    stocks.unshift(contentId);
    await redis.set(`user:${userId}:stocks`, stocks);
    return true;
  },

  async getIds(userId: string): Promise<string[]> {
    return (await redis.get<string[]>(`user:${userId}:stocks`)) ?? [];
  },
};
