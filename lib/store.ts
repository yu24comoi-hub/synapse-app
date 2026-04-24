import { redis } from "./redis";
import type { Content, Answer, Feedback, ContentSession } from "@/types";

export const store = {
  async add(content: Content, question: string): Promise<void> {
    const session: ContentSession = { content, question, answers: [] };
    await redis.set(`content:${content.id}`, session);
    await redis.zadd(`group:${content.groupId}:contents`, {
      score: new Date(content.createdAt).getTime(),
      member: content.id,
    });
  },

  async getAll(groupId: string): Promise<ContentSession[]> {
    const ids = await redis.zrange(`group:${groupId}:contents`, 0, -1, { rev: true });
    if (!ids.length) return [];
    const sessions = await Promise.all(
      (ids as string[]).map((id) => redis.get<ContentSession>(`content:${id}`))
    );
    return sessions.filter(Boolean) as ContentSession[];
  },

  async get(contentId: string): Promise<ContentSession | null> {
    return redis.get<ContentSession>(`content:${contentId}`);
  },

  async addAnswer(contentId: string, answer: Answer): Promise<boolean> {
    const session = await redis.get<ContentSession>(`content:${contentId}`);
    if (!session) return false;
    const idx = session.answers.findIndex((a) => a.memberId === answer.memberId);
    if (idx >= 0) session.answers[idx] = answer;
    else session.answers.push(answer);
    await redis.set(`content:${contentId}`, session);
    return true;
  },

  async setFeedback(contentId: string, feedback: Feedback): Promise<boolean> {
    const session = await redis.get<ContentSession>(`content:${contentId}`);
    if (!session) return false;
    session.feedback = feedback;
    await redis.set(`content:${contentId}`, session);
    return true;
  },

  async delete(contentId: string, groupId: string): Promise<void> {
    await redis.del(`content:${contentId}`);
    await redis.zrem(`group:${groupId}:contents`, contentId);
  },

  async getLastCuratedAt(groupId: string): Promise<string | null> {
    return redis.get<string>(`group:${groupId}:lastCuratedAt`);
  },

  async setLastCuratedAt(groupId: string, isoString: string): Promise<void> {
    await redis.set(`group:${groupId}:lastCuratedAt`, isoString);
  },
};
