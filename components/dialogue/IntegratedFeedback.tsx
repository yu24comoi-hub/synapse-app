"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import type { Feedback, Answer } from "@/types";

type Props = {
  contentId: string;
  existingFeedback?: Feedback;
  existingNextAnswers?: Answer[];
  onGenerated: (feedback: Feedback) => void;
  onNextAnswered?: (answers: Answer[]) => void;
};

export default function IntegratedFeedback({
  contentId,
  existingFeedback,
  existingNextAnswers = [],
  onGenerated,
  onNextAnswered,
}: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | undefined>(existingFeedback);
  const [nextAnswers, setNextAnswers] = useState<Answer[]>(existingNextAnswers);
  const [nextText, setNextText] = useState("");
  const [submittingNext, setSubmittingNext] = useState(false);

  const userId = session?.user?.id ?? "";
  const hasAnsweredNext = nextAnswers.some((a) => a.memberId === userId);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: Feedback = await res.json();
      setFeedback(data);
      onGenerated(data);
    } catch {
      alert("フィードバックの生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  async function handleNextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nextText.trim()) return;
    setSubmittingNext(true);
    try {
      const res = await fetch("/api/next-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, text: nextText.trim() }),
      });
      if (!res.ok) throw new Error("Submit failed");
      const newAnswer: Answer = {
        memberId: userId,
        memberName: session?.user?.name ?? "Anonymous",
        memberImage: session?.user?.image ?? undefined,
        text: nextText.trim(),
        submittedAt: new Date().toISOString(),
      };
      const updated = [...nextAnswers.filter(a => a.memberId !== userId), newAnswer];
      setNextAnswers(updated);
      setNextText("");
      onNextAnswered?.(updated);
    } catch {
      alert("送信に失敗しました。");
    } finally {
      setSubmittingNext(false);
    }
  }

  if (!feedback) {
    return (
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-4 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            AIが統合フィードバックを生成中...（30秒ほどかかります）
          </>
        ) : (
          "✦ 統合フィードバックを生成する"
        )}
      </button>
    );
  }

  return (
    <div className="space-y-5">
      {/* 統合フィードバック */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 space-y-5">
        <h3 className="font-bold text-indigo-900 text-lg">統合フィードバック</h3>
        <Section label="共通点" content={feedback.commonalities} labelClass="text-blue-500" />
        <Section label="相違点" content={feedback.differences} labelClass="text-amber-500" />
        <Section label="気づきの提示" content={feedback.insights} labelClass="text-purple-500" />
      </div>

      {/* 次の問い + 回答欄 */}
      <div className="bg-white border-2 border-indigo-200 rounded-xl p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">次の問い</p>
          <p className="text-indigo-900 font-medium leading-relaxed text-lg">{feedback.nextQuestion}</p>
        </div>

        {!hasAnsweredNext ? (
          <form onSubmit={handleNextSubmit} className="space-y-3">
            <textarea
              value={nextText}
              onChange={(e) => setNextText(e.target.value)}
              placeholder="一言でもOK。次の問いへの答えを書いてみてください..."
              rows={3}
              className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              disabled={submittingNext}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">短文でも大丈夫です</span>
              <button
                type="submit"
                disabled={submittingNext || !nextText.trim()}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                {submittingNext ? "送信中..." : "回答する"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-green-600 font-medium">✓ 回答済み</p>
            {nextAnswers.length > 0 && (
              <div className="space-y-2">
                {nextAnswers.map((a) => (
                  <div
                    key={a.memberId}
                    className={`rounded-xl p-3 text-sm ${
                      a.memberId === userId
                        ? "bg-indigo-50 border border-indigo-100"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <span className="font-medium text-gray-700 text-xs">{a.memberName}</span>
                    {a.memberId === userId && <span className="text-xs text-indigo-400 ml-1">(あなた)</span>}
                    <p className="text-gray-700 mt-1">{a.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ label, content, labelClass }: { label: string; content: string; labelClass: string }) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${labelClass}`}>{label}</p>
      <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
    </div>
  );
}
