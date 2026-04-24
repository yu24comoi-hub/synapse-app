import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groups } from "@/lib/groups";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId } = await req.json();
  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  const userGroups = await groups.getAllForUser(session.user.id);
  if (!userGroups.find((g) => g.id === groupId)) {
    return NextResponse.json({ error: "このグループに参加していません" }, { status: 403 });
  }

  await groups.setActiveGroup(session.user.id, groupId);
  return NextResponse.json({ success: true });
}
