"use client";
import { useState } from "react";
import type { Group } from "@/types";

type Props = {
  group: Group;
  inviteUrl: string;
  currentUserId: string;
};

export default function GroupPanel({ group, inviteUrl, currentUserId }: Props) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(inviteUrl);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(group.name);
  const [currentName, setCurrentName] = useState(group.name);
  const [savingName, setSavingName] = useState(false);

  async function copyInviteUrl() {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function regenerate() {
    setRegenerating(true);
    const res = await fetch("/api/group/invite", { method: "POST" });
    if (res.ok) {
      const { inviteCode } = await res.json();
      const base = currentUrl.split("/join/")[0];
      setCurrentUrl(`${base}/join/${inviteCode}`);
    }
    setRegenerating(false);
  }

  async function saveName() {
    if (!nameInput.trim() || nameInput === currentName) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    const res = await fetch("/api/group", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.trim() }),
    });
    if (res.ok) {
      setCurrentName(nameInput.trim());
    }
    setSavingName(false);
    setEditingName(false);
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">グループ名</p>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus
                className="flex-1 px-3 py-1.5 border border-indigo-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-semibold"
              />
              <button
                onClick={saveName}
                disabled={savingName || !nameInput.trim()}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingName ? "保存中..." : "保存"}
              </button>
              <button
                onClick={() => { setEditingName(false); setNameInput(currentName); }}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-gray-900">{currentName}</p>
              {currentUserId === group.ownerId && (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  ✎ 変更
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
            メンバー（{group.memberIds.length}名）
          </p>
          <ul className="space-y-1.5">
            {group.memberIds.map((id) => (
              <li key={id} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                {group.memberNames[id] ?? id}
                {id === group.ownerId && <span className="text-xs text-gray-400">（オーナー）</span>}
                {id === currentUserId && <span className="text-xs text-indigo-500">（あなた）</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">招待リンク</p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono truncate"
          />
          <button
            onClick={copyInviteUrl}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
          >
            {copied ? "コピー済み" : "コピー"}
          </button>
        </div>
        {currentUserId === group.ownerId && (
          <button
            onClick={regenerate}
            disabled={regenerating}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            {regenerating ? "更新中..." : "↻ 招待リンクを再生成（現在のリンクを無効化）"}
          </button>
        )}
        <p className="text-xs text-gray-400">このリンクをグループメンバーに共有してください</p>
      </div>
    </div>
  );
}
