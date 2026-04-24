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
