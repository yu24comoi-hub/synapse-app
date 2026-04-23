import type { Content, Answer, Feedback, ContentSession } from "@/types";

// プロトタイプ用インメモリストア。サーバー再起動でリセットされる。
const sessions = new Map<string, ContentSession>();

export const store = {
  add(content: Content, question: string): void {
    sessions.set(content.id, { content, question, answers: [] });
  },

  getAll(): ContentSession[] {
    return Array.from(sessions.values()).sort(
      (a, b) =>
        new Date(b.content.createdAt).getTime() -
        new Date(a.content.createdAt).getTime()
    );
  },

  get(contentId: string): ContentSession | undefined {
    return sessions.get(contentId);
  },

  addAnswer(contentId: string, answer: Answer): boolean {
    const session = sessions.get(contentId);
    if (!session) return false;
    const idx = session.answers.findIndex((a) => a.memberId === answer.memberId);
    if (idx >= 0) {
      session.answers[idx] = answer;
    } else {
      session.answers.push(answer);
    }
    return true;
  },

  setFeedback(contentId: string, feedback: Feedback): boolean {
    const session = sessions.get(contentId);
    if (!session) return false;
    session.feedback = feedback;
    return true;
  },
};
