import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { curate } from "@/lib/claude";
import { memory } from "@/lib/memory";
import { store } from "@/lib/store";
import { randomUUID } from "crypto";
import type { Content } from "@/types";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memorySummary = memory.getSummaryForCuration();
    const result = await curate(memorySummary);

    const content: Content = {
      id: randomUUID(),
      title: result.title,
      summary: result.summary,
      url: result.url ?? undefined,
      source: "ai",
      groupId: "group-1",
      createdAt: new Date().toISOString(),
    };

    store.add(content, result.question);

    return NextResponse.json({ contentId: content.id, content, question: result.question });
  } catch (e) {
    console.error("Curation error:", e);
    return NextResponse.json({ error: "Curation failed" }, { status: 500 });
  }
}
