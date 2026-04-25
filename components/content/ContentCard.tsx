"use client";
import { useState } from "react";
import Link from "next/link";
import type { ContentSession } from "@/types";
import { getSourceName } from "@/lib/utils";
import AnswerInput from "../dialogue/AnswerInput";

type Props = {
  session: ContentSession;
  userId: string;
};

export default function ContentCard({ session: initialSession, userId }: Props) {
  const [session, setSession] = useState(initialSession);
  const [expanded, setExpanded] = useState(false);

  const { content, answers, feedback } = session;
  const hasAnswered = answers.some((a) => a.memberId === userId);
  const sourceName = getSourceName(content.url);

  async function handleAnswerSubmitted() {
    const res = await fetch(`/api/content/${content.id}`);
    if (res.ok) setSession(await res.json());
  }

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden transition-all ${
        !hasAnswered
          ? "border-l-4 border-l-amber-400 border-t-gray-200 border-r-gray-200 border-b-gray-200"
          : "border-gray-200"
      }`}
    >
      {/* カード本体 → 詳細ページへ */}
      <Link href={`/content/${content.id}`} className="block p-5 hover:bg-gray-50/50 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
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
            {sourceName && <p className="text-xs text-gray-400 mt-1.5">🔗 {sourceName}</p>}
          </div>
          <div className="shrink-0">
            {content.source === "ai" ? (
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">AI</span>
            ) : (
              <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600 font-medium">
                {content.postedBy?.name ?? "メンバー"}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>{answers.length}名が回答</span>
          {hasAnswered && <span className="text-green-600 font-medium">✓ 回答済み</span>}
          {feedback && <span className="text-indigo-600 font-medium">✦ フィードバック生成済み</span>}
        </div>
      </Link>

      {/* 展開ボタン */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-2 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100 flex items-center justify-center gap-1.5"
      >
        {expanded ? (
          <><span>▲</span> 閉じる</>
        ) : (
          <><span>▼</span> 問いを{!hasAnswered ? "見て回答する" : "見る"}</>
        )}
      </button>

      {/* 展開エリア */}
      {expanded && (
        <div className="px-5 pb-5 pt-4 space-y-4 bg-gray-50/50 border-t border-indigo-50">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">問い</p>
            <p className="text-indigo-900 font-medium leading-relaxed">{session.question}</p>
          </div>

          {!hasAnswered ? (
            <AnswerInput contentId={content.id} onSubmitted={handleAnswerSubmitted} />
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">回答済みです</p>
              <Link href={`/content/${content.id}`} className="text-sm text-indigo-600 hover:underline">
                フィードバックを見る →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
