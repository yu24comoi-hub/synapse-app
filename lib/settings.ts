import { redis } from "./redis";
import type { UserSettings } from "@/types";

export const userSettings = {
  async get(userId: string): Promise<UserSettings | null> {
    return redis.get<UserSettings>(`user:${userId}:settings`);
  },

  async save(data: UserSettings): Promise<void> {
    await redis.set(`user:${data.userId}:settings`, data);
  },
};
