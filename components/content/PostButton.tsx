"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [comment, setComment] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function fetchFromUrl() {
    if (!url.trim()) return;
    setFetching(true);
    setFetchError("");
    const res = await fetch("/api/fetch-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setTitle(data.title ?? "");
      setSummary(data.summary ?? "");
    } else {
      setFetchError(data.error ?? "URLの取得に失敗しました");
    }
    setFetching(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, summary, url: url.trim() || undefined, comment: comment.trim() || undefined }),
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
    if (submitting || fetching) return;
    setOpen(false);
    setUrl(""); setTitle(""); setSummary(""); setComment("");
    setFetchError(""); setError("");
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">コンテンツを投稿</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* URL入力 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">URL（任意）</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), fetchFromUrl())}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 text-sm"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={fetchFromUrl}
                    disabled={!url.trim() || fetching || submitting}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 shrink-0"
                  >
                    {fetching ? (
                      <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
                    ) : "自動取得"}
                  </button>
                </div>
                {fetchError && <p className="text-amber-600 text-xs mt-1">{fetchError}</p>}
              </div>

              {/* タイトル */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
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

              {/* 内容 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  内容・要約 <span className="text-red-500">*</span>
                </label>
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

              {/* 投稿の理由 */}
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
                ) : "投稿する"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
