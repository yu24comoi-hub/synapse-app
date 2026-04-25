"use client";
import { useState } from "react";

export default function GroupJoinCreate() {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

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
      setDone(`「${groupName.trim()}」を作成しました。切り替えます...`);
      setTimeout(() => { window.location.href = "/home"; }, 1000);
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
      const group = await res.json();
      setDone(`「${group.name}」に参加しました。切り替えます...`);
      setTimeout(() => { window.location.href = "/home"; }, 1000);
    } else {
      const data = await res.json();
      setError(data.error ?? "エラーが発生しました");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
        {done}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex rounded-xl overflow-hidden border border-gray-200">
        <button
          onClick={() => setTab("create")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            tab === "create" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          新しく作成
        </button>
        <button
          onClick={() => setTab("join")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            tab === "join" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          招待コードで参加
        </button>
      </div>

      {tab === "create" ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="グループ名"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 text-sm"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !groupName.trim()}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm shrink-0"
          >
            {loading ? "作成中..." : "作成"}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="招待コードを入力"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 text-sm font-mono"
          />
          <button
            onClick={handleJoin}
            disabled={loading || !inviteCode.trim()}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm shrink-0"
          >
            {loading ? "参加中..." : "参加"}
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
