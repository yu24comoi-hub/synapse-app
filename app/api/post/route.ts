import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";
import { groups } from "@/lib/groups";
import { generateQuestionForContent } from "@/lib/claude";
import { randomUUID } from "crypto";
import type { Content } from "@/types";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const group = await groups.getByUserId(session.user.id);
  if (!group) {
    return NextResponse.json({ error: "グループに参加していません" }, { status: 400 });
  }

  const { title, summary, url, comment } = await req.json();
  if (!title?.trim() || !summary?.trim()) {
    return NextResponse.json({ error: "タイトルと内容は必須です" }, { status: 400 });
  }

  const question = await generateQuestionForContent(title.trim(), summary.trim());

  const content: Content = {
    id: randomUUID(),
    title: title.trim(),
    summary: summary.trim(),
    url: url?.trim() || undefined,
    source: "member",
    postedBy: {
      id: session.user.id,
      name: session.user.name ?? "Anonymous",
      comment: comment?.trim() || undefined,
    },
    groupId: group.id,
    createdAt: new Date().toISOString(),
  };

  await store.add(content, question);

  return NextResponse.json({ contentId: content.id, content, question });
}
