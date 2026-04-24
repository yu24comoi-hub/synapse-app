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
