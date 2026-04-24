import Link from "next/link";
import type { ContentSession } from "@/types";

type Props = {
  session: ContentSession;
  userId: string;
};

export default function TodayCurationCard({ session, userId }: Props) {
  const { content, answers, feedback } = session;
  const hasAnswered = answers.some((a) => a.memberId === userId);

  return (
    <Link href={`/content/${content.id}`}>
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white hover:from-indigo-700 hover:to-indigo-800 transition-all cursor-pointer shadow-md">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-bold text-xl leading-snug">{content.title}</h3>
          <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-white/20 font-medium">AI</span>
        </div>
        <p className="text-indigo-100 text-sm leading-relaxed line-clamp-3">{content.summary}</p>
        {content.url && (
          <p className="text-indigo-300 text-xs mt-2 truncate">🔗 {content.url}</p>
        )}
        <div className="mt-4 flex items-center gap-3 text-xs text-indigo-200">
          <span>{answers.length}名が回答</span>
          {hasAnswered ? (
            <span className="text-green-300 font-medium">✓ 回答済み</span>
          ) : (
            <span className="text-amber-300 font-medium">→ 回答する</span>
          )}
          {feedback && <span className="text-purple-300 font-medium">✦ FB生成済み</span>}
        </div>
      </div>
    </Link>
  );
}
