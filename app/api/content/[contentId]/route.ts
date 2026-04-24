import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentId } = await params;
  const contentSession = await store.get(contentId);
  if (!contentSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(contentSession);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentId } = await params;
  const contentSession = await store.get(contentId);
  if (!contentSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 投稿者本人のみ削除可能
  if (
    contentSession.content.source === "member" &&
    contentSession.content.postedBy?.id !== session.user.id
  ) {
    return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
  }

  await store.delete(contentId, contentSession.content.groupId);
  return NextResponse.json({ success: true });
}
