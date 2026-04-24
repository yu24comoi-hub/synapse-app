import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groups } from "@/lib/groups";

// グループ情報をプレビュー（認証不要）
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const info = await groups.getInfoByInviteCode(code);
  if (!info) return NextResponse.json({ error: "無効な招待コードです" }, { status: 404 });

  return NextResponse.json(info);
}

// グループに参加
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteCode } = await req.json();
  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code required" }, { status: 400 });
  }

  const group = await groups.join(
    inviteCode,
    session.user.id,
    session.user.name ?? "Anonymous"
  );
  if (!group) {
    return NextResponse.json({ error: "無効な招待コードです" }, { status: 400 });
  }

  return NextResponse.json(group);
}
