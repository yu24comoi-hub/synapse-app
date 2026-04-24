"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, summary, url: url || undefined, comment: comment || undefined }),
    });
    if (res.ok) {
      const { contentId } = await res.json();
      router.push(`/content/${contentId}`);
    } else {
      const data = await res.json();
      setError(data.error ?? "投稿に失敗しました");
      setSubmitting(false);
    }
  }

  function close() {
    if (submitting) return;
    setOpen(false);
    setTitle("");
    setSummary("");
    setUrl("");
    setComment("");
    setError("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-sm"
      >
        ＋ 投稿する
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">コンテンツを投稿</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">タイトル <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：生成AIで変わる働き方"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">内容・要約 <span className="text-red-500">*</span></label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="記事の内容やあなたが伝えたいことを書いてください"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 resize-none"
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">URL（任意）</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">なぜ共有するか（任意）</label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="例：みんなの意見を聞きたくて"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  disabled={submitting}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting || !title.trim() || !summary.trim()}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    AIが問いを生成中...
                  </>
                ) : (
                  "投稿する"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
