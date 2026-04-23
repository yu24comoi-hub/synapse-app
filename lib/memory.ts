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

const memories = new Map<string, MemberMemory>();

export const memory = {
  record(memberId: string, memberName: string, contentTitle: string, answer: string): void {
    if (!memories.has(memberId)) {
      memories.set(memberId, { memberId, memberName, interactions: [] });
    }
    const mem = memories.get(memberId)!;
    mem.interactions.push({ contentTitle, answer, timestamp: new Date().toISOString() });
    if (mem.interactions.length > 20) {
      mem.interactions = mem.interactions.slice(-20);
    }
  },

  getSummaryForCuration(): string {
    const all = Array.from(memories.values());
    if (all.length === 0) {
      return "グループメンバーのデータはまだありません。幅広いテーマから知的探求コンテンツを1件提供してください。";
    }
    return all
      .map((m) => {
        const topics = m.interactions
          .slice(-5)
          .map((i) => `"${i.contentTitle}"への回答: ${i.answer.slice(0, 60)}`)
          .join("; ");
        return `${m.memberName}: ${topics}`;
      })
      .join("\n");
  },
};
