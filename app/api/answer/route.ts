import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";
import { memory } from "@/lib/memory";
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

  const contentSession = store.get(contentId);
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

  store.addAnswer(contentId, answer);
  memory.record(
    session.user.id,
    session.user.name ?? "Anonymous",
    contentSession.content.title,
    text
  );

  return NextResponse.json({ success: true });
}
