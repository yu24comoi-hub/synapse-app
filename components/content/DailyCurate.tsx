"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DailyCurate() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    fetch("/api/curate", { method: "POST" })
      .then((res) => {
        if (res.ok) {
          setStatus("done");
          router.refresh();
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 flex items-center gap-3 text-indigo-600">
        <span className="inline-block w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin shrink-0" />
        <div>
          <p className="font-medium">今日のキュレーションを生成中...</p>
          <p className="text-xs text-indigo-400 mt-0.5">30秒ほどかかります</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-600">
        キュレーションの取得に失敗しました。ページを更新してください。
      </div>
    );
  }

  return null;
}
