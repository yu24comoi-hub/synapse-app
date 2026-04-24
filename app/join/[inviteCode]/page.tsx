"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useParams } from "next/navigation";

type GroupInfo = { name: string; memberCount: number };

export default function JoinPage() {
  const { data: session, status } = useSession();
  const params = useParams<{ inviteCode: string }>();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [infoError, setInfoError] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  // グループ情報を取得（認証不要）
  useEffect(() => {
    fetch(`/api/group/join?code=${params.inviteCode}`)
      .then(async (res) => {
        if (res.ok) setGroupInfo(await res.json());
        else setInfoError("無効または期限切れの招待リンクです");
      })
      .catch(() => setInfoError("グループ情報の取得に失敗しました"));
  }, [params.inviteCode]);

  async function handleJoin() {
    setJoining(true);
    setJoinError("");
    const res = await fetch("/api/group/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: params.inviteCode }),
    });
    if (res.ok) {
      // フルリロードで確実に新しいグループ状態を反映
      window.location.href = "/home";
    } else {
      const data = await res.json();
      setJoinError(data.error ?? "参加に失敗しました");
      setJoining(false);
    }
  }

  if (status === "loading" || (!groupInfo && !infoError)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        読み込み中...
      </div>
    );
  }

  if (infoError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8">
          <p className="text-red-500">{infoError}</p>
          <a href="/" className="text-indigo-600 hover:underline text-sm">トップへ戻る</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Synapse</h1>
          <p className="text-gray-500 mt-2 text-sm">グループへの招待</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs text-indigo-400 font-medium mb-1">招待されたグループ</p>
            <p className="text-xl font-bold text-indigo-900">{groupInfo!.name}</p>
            <p className="text-sm text-indigo-500 mt-1">現在 {groupInfo!.memberCount}名 が参加中</p>
          </div>

          {!session ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">参加するにはGoogleアカウントでログインしてください</p>
              <button
                onClick={() => signIn("google", { callbackUrl: `/join/${params.inviteCode}` })}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Googleでログインして参加
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{session.user.name}</span> として参加します
              </p>
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {joining ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    参加中...
                  </>
                ) : `「${groupInfo!.name}」に参加する`}
              </button>
              {joinError && <p className="text-red-500 text-sm">{joinError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
