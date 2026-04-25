import Link from "next/link";
import type { ContentSession } from "@/types";
import { getSourceName } from "@/lib/utils";
import StockButton from "./StockButton";

type Props = {
  session: ContentSession;
  userId: string;
  isStocked: boolean;
};

export default function ContentCard({ session, userId, isStocked }: Props) {
  const { content, answers, feedback } = session;
  const hasAnswered = answers.some((a) => a.memberId === userId);
  const sourceName = getSourceName(content.url);

  return (
    <Link href={`/content/${content.id}`}>
      <div
        className={`bg-white border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer ${
          !hasAnswered
            ? "border-l-4 border-l-amber-400 border-t-gray-200 border-r-gray-200 border-b-gray-200"
            : "border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* 未回答バナー */}
            {!hasAnswered && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="text-xs font-semibold text-amber-600">回答してください</span>
              </div>
            )}
            <h3 className="font-semibold text-gray-900">{content.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{content.summary}</p>
            {sourceName && (
              <p className="text-xs text-gray-400 mt-1.5">🔗 {sourceName}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {content.source === "ai" ? (
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">AI</span>
            ) : (
              <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600 font-medium">
                {content.postedBy?.name ?? "メンバー"}
              </span>
            )}
            <StockButton contentId={content.id} initialStocked={isStocked} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>{answers.length}名が回答</span>
          {hasAnswered && <span className="text-green-600 font-medium">✓ 回答済み</span>}
          {feedback && <span className="text-indigo-600 font-medium">✦ フィードバック生成済み</span>}
        </div>
      </div>
    </Link>
  );
}
