import { redis } from "./redis";
import { randomUUID } from "crypto";

export type AppNotification = {
  id: string;
  type: "new_curation" | "all_answered";
  message: string;
  contentId?: string;
  read: boolean;
  createdAt: string;
};

export const notifications = {
  async create(
    userIds: string[],
    type: AppNotification["type"],
    message: string,
    contentId?: string
  ): Promise<void> {
    for (const userId of userIds) {
      const notif: AppNotification = {
        id: randomUUID(),
        type,
        message,
        contentId,
        read: false,
        createdAt: new Date().toISOString(),
      };
      const existing: AppNotification[] = (await redis.get<AppNotification[]>(`user:${userId}:notifications`)) ?? [];
      await redis.set(`user:${userId}:notifications`, [notif, ...existing].slice(0, 30));
    }
  },

  async getAll(userId: string): Promise<AppNotification[]> {
    return (await redis.get<AppNotification[]>(`user:${userId}:notifications`)) ?? [];
  },

  async getUnreadCount(userId: string): Promise<number> {
    const notifs: AppNotification[] = (await redis.get<AppNotification[]>(`user:${userId}:notifications`)) ?? [];
    return notifs.filter((n) => !n.read).length;
  },

  async markAllRead(userId: string): Promise<void> {
    const notifs: AppNotification[] = (await redis.get<AppNotification[]>(`user:${userId}:notifications`)) ?? [];
    if (notifs.some((n) => !n.read)) {
      await redis.set(
        `user:${userId}:notifications`,
        notifs.map((n) => ({ ...n, read: true }))
      );
    }
  },
};
