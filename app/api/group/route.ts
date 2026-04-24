import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groups } from "@/lib/groups";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const group = await groups.getByUserId(session.user.id);
  if (!group) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(group);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const group = await groups.getByUserId(session.user.id);
  if (!group) return NextResponse.json({ error: "Not in a group" }, { status: 404 });
  if (group.ownerId !== session.user.id) {
    return NextResponse.json({ error: "オーナーのみ変更できます" }, { status: 403 });
  }
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "グループ名は必須です" }, { status: 400 });
  await groups.rename(group.id, name.trim());
  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await groups.getByUserId(session.user.id);
  if (existing) {
    return NextResponse.json({ error: "Already in a group" }, { status: 400 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Group name required" }, { status: 400 });
  }

  const group = await groups.create(
    name.trim(),
    session.user.id,
    session.user.name ?? "Anonymous"
  );
  return NextResponse.json(group);
}
