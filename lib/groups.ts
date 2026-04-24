import { redis } from "./redis";
import { randomUUID } from "crypto";
import type { Group } from "@/types";

export const groups = {
  async create(name: string, ownerId: string, ownerName: string): Promise<Group> {
    const group: Group = {
      id: randomUUID(),
      name,
      ownerId,
      memberIds: [ownerId],
      memberNames: { [ownerId]: ownerName },
      inviteCode: randomUUID().replace(/-/g, "").slice(0, 12),
      createdAt: new Date().toISOString(),
    };
    await redis.set(`group:${group.id}`, group);
    await redis.set(`invite:${group.inviteCode}`, group.id);
    await addToUserGroups(ownerId, group.id);
    return group;
  },

  async get(groupId: string): Promise<Group | null> {
    return redis.get<Group>(`group:${groupId}`);
  },

  async getByUserId(userId: string): Promise<Group | null> {
    await migrateLegacyKey(userId);

    const activeGroupId = await redis.get<string>(`user:${userId}:activeGroupId`);
    if (activeGroupId) {
      const group = await redis.get<Group>(`group:${activeGroupId}`);
      if (group) return group;
    }

    // アクティブが壊れている場合は最初のグループにフォールバック
    const groupIds = await redis.get<string[]>(`user:${userId}:groupIds`) ?? [];
    for (const id of groupIds) {
      const group = await redis.get<Group>(`group:${id}`);
      if (group) {
        await redis.set(`user:${userId}:activeGroupId`, id);
        return group;
      }
    }
    return null;
  },

  async getAllForUser(userId: string): Promise<Group[]> {
    await migrateLegacyKey(userId);
    const groupIds = await redis.get<string[]>(`user:${userId}:groupIds`) ?? [];
    const list = await Promise.all(groupIds.map((id) => redis.get<Group>(`group:${id}`)));
    return list.filter(Boolean) as Group[];
  },

  async setActiveGroup(userId: string, groupId: string): Promise<void> {
    await redis.set(`user:${userId}:activeGroupId`, groupId);
  },

  async join(inviteCode: string, userId: string, userName: string): Promise<Group | null> {
    const groupId = await redis.get<string>(`invite:${inviteCode}`);
    if (!groupId) return null;
    const group = await redis.get<Group>(`group:${groupId}`);
    if (!group) return null;

    if (!group.memberIds.includes(userId)) {
      group.memberIds.push(userId);
    }
    group.memberNames[userId] = userName;
    await redis.set(`group:${groupId}`, group);
    await addToUserGroups(userId, groupId);
    return group;
  },

  async getInfoByInviteCode(inviteCode: string): Promise<{ name: string; memberCount: number } | null> {
    const groupId = await redis.get<string>(`invite:${inviteCode}`);
    if (!groupId) return null;
    const group = await redis.get<Group>(`group:${groupId}`);
    if (!group) return null;
    return { name: group.name, memberCount: group.memberIds.length };
  },

  async rename(groupId: string, newName: string): Promise<void> {
    const group = await redis.get<Group>(`group:${groupId}`);
    if (!group) throw new Error("Group not found");
    group.name = newName;
    await redis.set(`group:${groupId}`, group);
  },

  async regenerateInvite(groupId: string): Promise<string> {
    const group = await redis.get<Group>(`group:${groupId}`);
    if (!group) throw new Error("Group not found");
    await redis.del(`invite:${group.inviteCode}`);
    group.inviteCode = randomUUID().replace(/-/g, "").slice(0, 12);
    await redis.set(`group:${groupId}`, group);
    await redis.set(`invite:${group.inviteCode}`, groupId);
    return group.inviteCode;
  },
};

// ユーザーのグループリストに追加してアクティブに設定
async function addToUserGroups(userId: string, groupId: string): Promise<void> {
  const existing = await redis.get<string[]>(`user:${userId}:groupIds`) ?? [];
  if (!existing.includes(groupId)) {
    await redis.set(`user:${userId}:groupIds`, [...existing, groupId]);
  }
  await redis.set(`user:${userId}:activeGroupId`, groupId);
}

// 旧形式（単一groupId）から新形式（配列）への移行
async function migrateLegacyKey(userId: string): Promise<void> {
  const legacyGroupId = await redis.get<string>(`user:${userId}:groupId`);
  if (!legacyGroupId) return;
  const existing = await redis.get<string[]>(`user:${userId}:groupIds`) ?? [];
  if (!existing.includes(legacyGroupId)) {
    await redis.set(`user:${userId}:groupIds`, [...existing, legacyGroupId]);
  }
  const hasActive = await redis.get<string>(`user:${userId}:activeGroupId`);
  if (!hasActive) {
    await redis.set(`user:${userId}:activeGroupId`, legacyGroupId);
  }
  await redis.del(`user:${userId}:groupId`);
}
