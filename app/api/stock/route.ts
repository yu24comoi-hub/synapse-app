import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stock } from "@/lib/stock";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { contentId } = await req.json();
  if (!contentId) return NextResponse.json({ error: "contentId required" }, { status: 400 });

  const stocked = await stock.toggle(session.user.id, contentId);
  return NextResponse.json({ stocked });
}
