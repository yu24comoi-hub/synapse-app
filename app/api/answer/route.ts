import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";
import { memory } from "@/lib/memory";
import { groups } from "@/lib/groups";
import { generateFeedback } from "@/lib/claude";
import { notifications } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
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
    const memberEmails = group.memberEmails ?? {};
    const appUrl = process.env.NEXTAUTH_URL ?? "";
    const contentUrl = `${appUrl}/content/${contentId}`;

    // 回答者以外のメンバーに「誰かが回答した」通知メールを送信
    const otherEmails = group.memberIds
      .filter((id) => id !== session.user.id)
      .map((id) => memberEmails[id])
      .filter((e): e is string => Boolean(e));

    void sendEmail({
      to: otherEmails,
      subject: `Synapse: ${answer.memberName}さんが回答しました`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6366f1; margin-bottom: 16px;">Synapse</h2>
          <p><strong>${answer.memberName}</strong>さんが「${contentSession.content.title}」に回答しました。</p>
          <p>あなたの考えも共有しませんか？</p>
          <a href="${contentUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; margin-top: 8px;">回答する</a>
        </div>
      `,
    }).catch(() => {});

    if (updated && updated.answers.length >= group.memberIds.length && !updated.feedback) {
      // 全員回答 → 通知 + 全員へ完了メール + バックグラウンドでフィードバック生成
      void notifications.create(
        group.memberIds,
        "all_answered",
        `「${updated.content.title}」全員が回答しました。フィードバックを生成できます`,
        contentId
      );
      const allEmails = group.memberIds.map((id) => memberEmails[id]).filter((e): e is string => Boolean(e));
      void sendEmail({
        to: allEmails,
        subject: `Synapse: 「${updated.content.title}」全員が回答しました`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #6366f1; margin-bottom: 16px;">Synapse</h2>
            <p>「<strong>${updated.content.title}</strong>」への全員の回答が揃いました！</p>
            <p>AIが統合フィードバックを生成しています。ぜひ確認してください。</p>
            <a href="${contentUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; margin-top: 8px;">フィードバックを見る</a>
          </div>
        `,
      }).catch(() => {});
      void generateFeedback(
        updated.content.title,
        updated.question,
        updated.answers.map((a) => ({ memberName: a.memberName, text: a.text }))
      ).then((feedback) => store.setFeedback(contentId, feedback)).catch(() => {});
    }
  }

  return NextResponse.json({ success: true });
}
