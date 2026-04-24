"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"create" | "join">("create");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        読み込み中...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Synapse</h1>
          <p className="text-gray-500">グループに参加するにはログインが必要です</p>
          <button
            onClick={() => signIn("google", { callbackUrl: window.location.href })}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
          >
            Googleでログイン
          </button>
        </div>
      </div>
    );
  }

  async function handleCreate() {
    if (!groupName.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: groupName.trim() }),
    });
    if (res.ok) {
      router.push("/home");
    } else {
      const data = await res.json();
      setError(data.error ?? "エラーが発生しました");
    }
    setLoading(false);
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/group/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: inviteCode.trim() }),
    });
    if (res.ok) {
      router.push("/home");
    } else {
      const data = await res.json();
      setError(data.error ?? "エラーが発生しました");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Synapse</h1>
          <p className="text-gray-500 mt-2">グループを作成するか、招待コードで参加してください</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button
              onClick={() => setTab("create")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "create"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              グループを作成
            </button>
            <button
              onClick={() => setTab("join")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "join"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              招待コードで参加
            </button>
          </div>

          {tab === "create" ? (
            <div className="space-y-3">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="グループ名（例：勉強会、読書クラブ）"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
              <button
                onClick={handleCreate}
                disabled={loading || !groupName.trim()}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "作成中..." : "グループを作成する"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="招待コードを入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-mono"
              />
              <button
                onClick={handleJoin}
                disabled={loading || !inviteCode.trim()}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "参加中..." : "グループに参加する"}
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
