"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import QuestionPrompt from "@/components/dialogue/QuestionPrompt";
import AnswerInput from "@/components/dialogue/AnswerInput";
import IntegratedFeedback from "@/components/dialogue/IntegratedFeedback";
import { getSourceName } from "@/lib/utils";
import type { ContentSession, Feedback } from "@/types";

export default function ContentPage() {
  const { data: session, status } = useSession();
  const params = useParams<{ contentId: string }>();
  const router = useRouter();
  const [data, setData] = useState<ContentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  async function fetchData() {
    const res = await fetch(`/api/content/${params.contentId}`);
    if (res.ok) {
      setData(await res.json());
    } else if (res.status === 404) {
      router.replace("/home");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (status !== "loading") fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.contentId, status]);

  async function handleDelete() {
    if (!confirm("この投稿を削除しますか？")) return;
    setDeleting(true);
    const res = await fetch(`/api/content/${params.contentId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/home");
    } else {
      alert("削除に失敗しました");
      setDeleting(false);
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        読み込み中...
      </div>
    );
  }

  if (!data) return null;

  const userId = session?.user?.id ?? "";
  const hasAnswered = data.answers.some((a) => a.memberId === userId);
  const canDelete =
    data.content.source === "member" && data.content.postedBy?.id === userId;
  const sourceName = getSourceName(data.content.url);

  return (
    <div className="space-y-6">
      {/* 戻るボタン */}
      <div className="flex items-center justify-between">
        <Link
          href="/home"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
        >
          ← ホームへ
        </Link>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? "削除中..." : "この投稿を削除"}
          </button>
        )}
      </div>

      {/* コンテンツ */}
      <div>
        <div className="flex items-start gap-2 mb-1">
          {data.content.source === "ai" ? (
            <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium mt-0.5">
              AI
            </span>
          ) : (
            <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-green-50 text-green-600 font-medium mt-0.5">
              {data.content.postedBy?.name ?? "メンバー"}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{data.content.title}</h1>
        </div>
        {data.content.source === "member" && data.content.postedBy?.comment && (
          <p className="text-sm text-gray-500 ml-10 mb-1 italic">
            「{data.content.postedBy.comment}」
          </p>
        )}
        {data.content.url && (
          <div className="flex items-center gap-1.5 ml-10 mt-1">
            <a
              href={data.content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 text-sm hover:underline"
            >
              ソースを開く →
            </a>
            {sourceName && (
              <span className="text-xs text-gray-400">（{sourceName}）</span>
            )}
          </div>
        )}
        <p className="text-gray-600 mt-3 leading-relaxed">{data.content.summary}</p>
      </div>

      <QuestionPrompt question={data.question} />

      {!hasAnswered ? (
        <div>
          <p className="text-sm text-gray-500 mb-3">
            他のメンバーの回答は、あなたが送信した後に表示されます。
          </p>
          <AnswerInput contentId={params.contentId} onSubmitted={fetchData} />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              メンバーの回答{" "}
              <span className="text-gray-400 font-normal text-sm">
                ({data.answers.length}件)
              </span>
            </h3>
            <div className="space-y-3">
              {data.answers.map((a) => (
                <div
                  key={a.memberId}
                  className={`bg-white border rounded-xl p-4 ${
                    a.memberId === userId
                      ? "border-indigo-200 bg-indigo-50/30"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {a.memberImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.memberImage} alt="" className="w-6 h-6 rounded-full" />
                    )}
                    <span className="font-medium text-sm text-gray-700">{a.memberName}</span>
                    {a.memberId === userId && (
                      <span className="text-xs text-indigo-500">(あなた)</span>
                    )}
                  </div>
                  <p className="text-gray-800 leading-relaxed">{a.text}</p>
                </div>
              ))}
            </div>
          </div>

          <IntegratedFeedback
            contentId={params.contentId}
            existingFeedback={data.feedback}
            existingNextAnswers={data.nextQuestionAnswers ?? []}
            onGenerated={(feedback: Feedback) => setData({ ...data, feedback })}
            onNextAnswered={(nextQuestionAnswers) => setData({ ...data, nextQuestionAnswers })}
          />

          <button
            onClick={fetchData}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ↻ 更新する（他のメンバーの回答を確認）
          </button>
        </div>
      )}
    </div>
  );
}
