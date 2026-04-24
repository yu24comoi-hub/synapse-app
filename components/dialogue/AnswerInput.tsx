"use client";
import { useState } from "react";

type Props = {
  contentId: string;
  onSubmitted: () => void;
};

export default function AnswerInput({ contentId, onSubmitted }: Props) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, text: text.trim() }),
      });
      if (!res.ok) throw new Error("Submit failed");
      onSubmitted();
    } catch {
      alert("送信に失敗しました。再試行してください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="一言でもOK。直感で答えてみてください..."
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 leading-relaxed"
        disabled={submitting}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">短文でも大丈夫です</span>
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {submitting ? "送信中..." : "回答を送信"}
        </button>
      </div>
    </form>
  );
}
