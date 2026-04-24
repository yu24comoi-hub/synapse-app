import { redis } from "./redis";
import type { UserSettings } from "@/types";

type InteractionRecord = {
  contentTitle: string;
  answer: string;
  timestamp: string;
};

type MemberMemory = {
  memberId: string;
  memberName: string;
  interactions: InteractionRecord[];
};

export const memory = {
  async record(memberId: string, memberName: string, contentTitle: string, answer: string): Promise<void> {
    const key = `memory:${memberId}`;
    const mem: MemberMemory = (await redis.get<MemberMemory>(key)) ?? {
      memberId,
      memberName,
      interactions: [],
    };
    mem.interactions.push({ contentTitle, answer, timestamp: new Date().toISOString() });
    if (mem.interactions.length > 20) {
      mem.interactions = mem.interactions.slice(-20);
    }
    await redis.set(key, mem);
  },

  async getSummaryForCuration(
    memberIds: string[],
    settingsMap: Record<string, UserSettings>
  ): Promise<string> {
    if (!memberIds.length) {
      return "グループメンバーのデータはまだありません。幅広いテーマから知的探求コンテンツを1件提供してください。";
    }
    const mems = await Promise.all(
      memberIds.map((id) => redis.get<MemberMemory>(`memory:${id}`))
    );
    const parts: string[] = [];
    for (const mem of mems) {
      if (!mem) continue;
      const s = settingsMap[mem.memberId];
      const interestStr = s?.interests?.length ? `関心領域: ${s.interests.join(", ")}. ` : "";
      const topics = mem.interactions
        .slice(-5)
        .map((i) => `"${i.contentTitle}"への回答: ${i.answer.slice(0, 60)}`)
        .join("; ");
      parts.push(`${mem.memberName}: ${interestStr}${topics || "回答なし"}`);
    }
    return parts.length
      ? parts.join("\n")
      : "グループメンバーのデータはまだありません。幅広いテーマから知的探求コンテンツを1件提供してください。";
  },
};
