import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";
import { memory } from "@/lib/memory";
import { groups } from "@/lib/groups";
import { generateFeedback } from "@/lib/claude";
import { notifications } from "@/lib/notifications";
import type { Answer } from "@/types";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentId, text } = await req.json();
  if (!contentId || !text) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const contentSession = await store.get(contentId);
  if (!contentSession) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const answer: Answer = {
    memberId: session.user.id,
    memberName: session.user.name ?? "Anonymous",
    memberImage: session.user.image ?? undefined,
    text,
    submittedAt: new Date().toISOString(),
  };

  await store.addAnswer(contentId, answer);
  await memory.record(
    session.user.id,
    session.user.name ?? "Anonymous",
    contentSession.content.title,
    text
  );

  // 全員回答済みならバックグラウンドでフィードバック自動生成
  const group = await groups.get(contentSession.content.groupId);
  if (group) {
    const updated = await store.get(contentId);
    if (updated && updated.answers.length >= group.memberIds.length && !updated.feedback) {
      // 全員回答 → 通知 + バックグラウンドでフィードバック生成
      void notifications.create(
        group.memberIds,
        "all_answered",
        `「${updated.content.title}」全員が回答しました。フィードバックを生成できます`,
        contentId
      );
      void generateFeedback(
        updated.content.title,
        updated.question,
        updated.answers.map((a) => ({ memberName: a.memberName, text: a.text }))
      ).then((feedback) => store.setFeedback(contentId, feedback)).catch(() => {});
    }
  }

  return NextResponse.json({ success: true });
}
