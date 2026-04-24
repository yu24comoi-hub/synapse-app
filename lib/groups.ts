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
    await redis.set(`user:${ownerId}:groupId`, group.id);
    return group;
  },

  async get(groupId: string): Promise<Group | null> {
    return redis.get<Group>(`group:${groupId}`);
  },

  async getByUserId(userId: string): Promise<Group | null> {
    const groupId = await redis.get<string>(`user:${userId}:groupId`);
    if (!groupId) return null;
    return redis.get<Group>(`group:${groupId}`);
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
    await redis.set(`user:${userId}:groupId`, groupId);
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
