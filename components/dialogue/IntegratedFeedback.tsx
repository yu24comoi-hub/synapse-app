"use client";
import { useState } from "react";
import type { Feedback } from "@/types";

type Props = {
  contentId: string;
  existingFeedback?: Feedback;
  onGenerated: (feedback: Feedback) => void;
};

export default function IntegratedFeedback({ contentId, existingFeedback, onGenerated }: Props) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | undefined>(existingFeedback);

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
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 space-y-5">
      <h3 className="font-bold text-indigo-900 text-lg">統合フィードバック</h3>

      <Section
        label="共通点"
        content={feedback.commonalities}
        labelClass="text-blue-500"
      />
      <Section
        label="相違点"
        content={feedback.differences}
        labelClass="text-amber-500"
      />
      <Section
        label="気づきの提示"
        content={feedback.insights}
        labelClass="text-purple-500"
      />

      <div className="bg-white border border-indigo-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          次の問い
        </p>
        <p className="text-indigo-900 font-medium leading-relaxed">{feedback.nextQuestion}</p>
      </div>
    </div>
  );
}

function Section({
  label,
  content,
  labelClass,
}: {
  label: string;
  content: string;
  labelClass: string;
}) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${labelClass}`}>
        {label}
      </p>
      <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
    </div>
  );
}
