"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CurateButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCurate() {
    setLoading(true);
    try {
      const res = await fetch("/api/curate", { method: "POST" });
      if (!res.ok) throw new Error("Curation failed");
      router.refresh();
    } catch {
      alert("キュレーションに失敗しました。APIキーと環境変数を確認してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCurate}
      disabled={loading}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center gap-2"
    >
      {loading ? (
        <>
          <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          AIがリサーチ中...
        </>
      ) : (
        "＋ 新しいトピックをキュレーション"
      )}
    </button>
  );
}
