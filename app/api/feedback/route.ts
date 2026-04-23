import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";
import { generateFeedback } from "@/lib/claude";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentId } = await req.json();
  if (!contentId) {
    return NextResponse.json({ error: "Missing contentId" }, { status: 400 });
  }

  const contentSession = store.get(contentId);
  if (!contentSession) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  if (contentSession.answers.length === 0) {
    return NextResponse.json({ error: "No answers yet" }, { status: 400 });
  }

  try {
    const feedback = await generateFeedback(
      contentSession.content.title,
      contentSession.question,
      contentSession.answers.map((a) => ({ memberName: a.memberName, text: a.text }))
    );

    store.setFeedback(contentId, feedback);
    return NextResponse.json(feedback);
  } catch (e) {
    console.error("Feedback error:", e);
    return NextResponse.json({ error: "Feedback generation failed" }, { status: 500 });
  }
}
