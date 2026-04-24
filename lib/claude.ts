import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const MODEL = "claude-sonnet-4-6";

export async function curate(memorySummary: string): Promise<{
  title: string;
  summary: string;
  url?: string | null;
  question: string;
}> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: `あなたはグループの知的探求を支援するキュレーターです。
グループメンバーの関心・思考パターンを踏まえ、彼らがまだ知らない「未知の情報」を1つ選び、深い対話を促す問いを作成してください。

【重要】必ず日本語のウェブサイト・ニュースサイト・論文・ブログを情報源にしてください。英語のサイトは使用しないでください。日本語で回答してください。

必ず以下のJSON形式のみを返してください（前後に説明文は入れないこと）：
{
  "title": "コンテンツのタイトル（30字以内）",
  "summary": "内容の要約（150字以内）",
  "url": "参照URL（不明の場合はnull）",
  "question": "短い問い（25字以内。日常会話の口調で、忙しい人でも2〜3文で答えられる問い。例：「直感的に賛成？反対？」「あなたの仕事に関係ある？」「もし自分ごとだったら？」）"
}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `グループメンバーのこれまでの関心・回答履歴：\n${memorySummary}\n\n最新の未知情報を1件キュレーションしてください。`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Failed to parse Claude response: ${text}`);
  return JSON.parse(match[0]);
}

export async function generateQuestionForContent(
  title: string,
  summary: string
): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: [
      {
        type: "text",
        text: `メンバーが投稿したコンテンツに対して、短い問いを1つ作成してください。
25字以内、日常会話の口調で、忙しい人でも2〜3文で答えられる問いにしてください。
例：「直感的に賛成？反対？」「あなたの仕事に関係ある？」「もし自分ごとだったら？」
問いの文章のみを返してください（前後に説明文は入れないこと）。`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `タイトル：${title}\n内容：${summary}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return text.trim();
}

export async function generateFeedback(
  contentTitle: string,
  question: string,
  answers: { memberName: string; text: string }[]
): Promise<{
  commonalities: string;
  differences: string;
  insights: string;
  nextQuestion: string;
}> {
  const answersText = answers.map((a) => `【${a.memberName}】${a.text}`).join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: `あなたはグループの思考を深める対話ファシリテーターです。
メンバーの回答を材料として、1人では到達できなかった視点・知識・問いを届けてください。
審判ではなく、思考の触媒として機能してください。

必ず以下のJSON形式のみを返してください：
{
  "commonalities": "共通点（全員の回答に共通する認識・前提を1〜2文で）",
  "differences": "相違点（対立軸・視点の違いを言語化。優劣の判断なし。1〜2文で）",
  "insights": "気づきの提示（相違点の背景にある概念・理論・事例をAIが補足。2〜3文で）",
  "nextQuestion": "次の問い（さらに深く考えるための新しい問いを1文で）"
}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `コンテンツ：${contentTitle}\n\n問い：${question}\n\nメンバーの回答：\n${answersText}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Failed to parse Claude response: ${text}`);
  return JSON.parse(match[0]);
}
