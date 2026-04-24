import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groups } from "@/lib/groups";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const group = await groups.getByUserId(session.user.id);
  if (!group) {
    return NextResponse.json({ error: "Not in a group" }, { status: 400 });
  }
  if (group.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Only owner can regenerate invite" }, { status: 403 });
  }

  const inviteCode = await groups.regenerateInvite(group.id);
  return NextResponse.json({ inviteCode });
}
