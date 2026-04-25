"use client";
import { useState } from "react";
import Link from "next/link";
import type { ContentSession } from "@/types";
import AnswerInput from "../dialogue/AnswerInput";

type Props = {
  session: ContentSession;
  userId: string;
};

export default function TodayCurationCard({ session: initialSession, userId }: Props) {
  const [session, setSession] = useState(initialSession);
  const [expanded, setExpanded] = useState(false);

  const { content, answers, feedback } = session;
  const hasAnswered = answers.some((a) => a.memberId === userId);

  async function handleAnswerSubmitted() {
    const res = await fetch(`/api/content/${content.id}`);
    if (res.ok) setSession(await res.json());
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      {/* メインカード → 詳細へ */}
      <Link
        href={`/content/${content.id}`}
        className="block bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white hover:from-indigo-700 hover:to-indigo-800 transition-all"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-bold text-xl leading-snug">{content.title}</h3>
          <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-white/20 font-medium">AI</span>
        </div>
        <p className="text-indigo-100 text-sm leading-relaxed line-clamp-3">{content.summary}</p>
        {content.url && <p className="text-indigo-300 text-xs mt-2 truncate">🔗 {content.url}</p>}
        <div className="mt-4 flex items-center gap-3 text-xs">
          {!hasAnswered ? (
            <span className="flex items-center gap-1.5 bg-amber-400/20 text-amber-200 px-3 py-1.5 rounded-full font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
              回答してください
            </span>
          ) : (
            <span className="text-green-300 font-medium">✓ 回答済み</span>
          )}
          <span className="text-indigo-200">{answers.length}名が回答</span>
          {feedback && <span className="text-purple-300 font-medium">✦ FB生成済み</span>}
        </div>
      </Link>

      {/* 展開ボタン */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-2 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 font-medium"
      >
        {expanded ? (
          <><span>▲</span> 閉じる</>
        ) : (
          <><span>▼</span> 問いを{!hasAnswered ? "見て回答する" : "見る"}</>
        )}
      </button>

      {/* 展開エリア */}
      {expanded && (
        <div className="bg-white px-5 pb-5 pt-4 space-y-4 border border-t-0 border-indigo-100 rounded-b-2xl">
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
