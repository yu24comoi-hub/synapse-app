import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userSettings } from "@/lib/settings";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const s = await userSettings.get(session.user.id);
  return NextResponse.json(s ?? { userId: session.user.id, displayName: session.user.name ?? "", interests: [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { displayName, interests } = await req.json();
  await userSettings.save({
    userId: session.user.id,
    displayName: displayName ?? "",
    interests: interests ?? [],
  });
  return NextResponse.json({ success: true });
}
