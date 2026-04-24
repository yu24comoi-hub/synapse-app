"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

export default function JoinPage() {
  const { data: session, status } = useSession();
  const params = useParams<{ inviteCode: string }>();
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading" || joining) return;
    if (!session) return;
    setJoining(true);
    fetch("/api/group/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: params.inviteCode }),
    })
      .then(async (res) => {
        if (res.ok) {
          router.push("/home");
        } else {
          const data = await res.json();
          setError(data.error ?? "招待コードが無効です");
          setJoining(false);
        }
      })
      .catch(() => {
        setError("エラーが発生しました");
        setJoining(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  if (status === "loading" || joining) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        グループに参加中...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-3xl font-bold text-gray-900">Synapse</h1>
          <p className="text-gray-600">グループへの招待を受けました</p>
          <p className="text-gray-500 text-sm">参加するにはGoogleアカウントでログインしてください</p>
          <button
            onClick={() =>
              signIn("google", { callbackUrl: `/join/${params.inviteCode}` })
            }
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
          >
            Googleでログインして参加
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.push("/setup")}
          className="text-indigo-600 hover:underline text-sm"
        >
          セットアップページへ
        </button>
      </div>
    </div>
  );
}
