import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";
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

  const answer: Answer = {
    memberId: session.user.id,
    memberName: session.user.name ?? "Anonymous",
    memberImage: session.user.image ?? undefined,
    text,
    submittedAt: new Date().toISOString(),
  };

  const ok = await store.addNextAnswer(contentId, answer);
  if (!ok) return NextResponse.json({ error: "Content not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
