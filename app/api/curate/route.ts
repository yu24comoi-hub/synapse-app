import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { curate } from "@/lib/claude";
import { memory } from "@/lib/memory";
import { store } from "@/lib/store";
import { groups } from "@/lib/groups";
import { userSettings } from "@/lib/settings";
import { randomUUID } from "crypto";
import { notifications } from "@/lib/notifications";
import type { Content } from "@/types";

function todayJST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function dateJST(iso: string): string {
  return new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const group = await groups.getByUserId(session.user.id);
  if (!group) {
    return NextResponse.json({ error: "グループに参加していません" }, { status: 400 });
  }

  // 今日すでにキュレーション済みなら早期リターン
  const lastCuratedAt = await store.getLastCuratedAt(group.id);
  if (lastCuratedAt && dateJST(lastCuratedAt) === todayJST()) {
    return NextResponse.json({ alreadyDone: true });
  }

  const settingsList = await Promise.all(
    group.memberIds.map((id) => userSettings.get(id))
  );
  const settingsMap = Object.fromEntries(
    group.memberIds.map((id, i) => [id, settingsList[i] ?? { userId: id, displayName: "", interests: [] }])
  );

  const memorySummary = await memory.getSummaryForCuration(group.memberIds, settingsMap);
  const result = await curate(memorySummary);

  const content: Content = {
    id: randomUUID(),
    title: result.title,
    summary: result.summary,
    url: result.url ?? undefined,
    source: "ai",
    groupId: group.id,
    createdAt: new Date().toISOString(),
  };

  await store.add(content, result.question);
  await store.setLastCuratedAt(group.id, content.createdAt);

  // グループ全員に通知
  void notifications.create(
    group.memberIds,
    "new_curation",
    `新しいトピック「${content.title}」が届きました`,
    content.id
  );

  return NextResponse.json({ contentId: content.id, content, question: result.question });
}
