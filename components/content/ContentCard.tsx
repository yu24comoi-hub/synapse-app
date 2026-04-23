import Link from "next/link";
import type { ContentSession } from "@/types";

type Props = {
  session: ContentSession;
  userId: string;
};

export default function ContentCard({ session, userId }: Props) {
  const { content, answers, feedback } = session;
  const hasAnswered = answers.some((a) => a.memberId === userId);

  return (
    <Link href={`/content/${content.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{content.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{content.summary}</p>
          </div>
          <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
            AI
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
          <span>{answers.length}名が回答</span>
          {hasAnswered && (
            <span className="text-green-600 font-medium">✓ 回答済み</span>
          )}
          {feedback && (
            <span className="text-indigo-600 font-medium">✦ フィードバック生成済み</span>
          )}
          {!hasAnswered && (
            <span className="text-amber-600 font-medium">→ 回答してください</span>
          )}
        </div>
      </div>
    </Link>
  );
}
