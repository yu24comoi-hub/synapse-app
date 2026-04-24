import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

function extract(html: string, ...patterns: RegExp[]): string {
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
  }
  return "";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  let rawTitle = "";
  let rawDesc = "";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SynapseBot/1.0)" },
    });
    clearTimeout(timer);
    const html = await res.text();

    rawTitle = extract(
      html,
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      /<title[^>]*>([^<]+)<\/title>/i
    );
    rawDesc = extract(
      html,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i
    );
  } catch {
    return NextResponse.json({ error: "URLの取得に失敗しました。手動で入力してください。" }, { status: 400 });
  }

  if (!rawTitle && !rawDesc) {
    return NextResponse.json({ error: "ページ情報を取得できませんでした。手動で入力してください。" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  const result = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `以下のWebページ情報をもとに、グループ学習用のタイトルと要約を日本語で作成してください。

URL: ${url}
ページタイトル: ${rawTitle}
ページ説明: ${rawDesc}

必ず以下のJSON形式のみを返してください：
{
  "title": "内容がわかる簡潔なタイトル（30字以内）",
  "summary": "内容の要約（150字以内）"
}`
    }],
  });

  const text = result.content[0].type === "text" ? result.content[0].text : "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return NextResponse.json({ title: rawTitle, summary: rawDesc });

  try {
    return NextResponse.json(JSON.parse(match[0]));
  } catch {
    return NextResponse.json({ title: rawTitle, summary: rawDesc });
  }
}
