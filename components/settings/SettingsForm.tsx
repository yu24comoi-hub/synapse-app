"use client";
import { useState } from "react";

type Props = {
  userId: string;
  initialDisplayName: string;
  initialInterests: string[];
};

export default function SettingsForm({ initialDisplayName, initialInterests }: Props) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function addInterest() {
    const val = interestInput.trim();
    if (!val || interests.includes(val)) return;
    setInterests([...interests, val]);
    setInterestInput("");
  }

  function removeInterest(tag: string) {
    setInterests(interests.filter((i) => i !== tag));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, interests }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">表示名</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="グループ内での表示名"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          関心領域
          <span className="ml-1 text-gray-400 font-normal text-xs">（AIキュレーションに活用されます）</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addInterest()}
            placeholder="例：投資、AI、健康（Enterで追加）"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
          />
          <button
            onClick={addInterest}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            追加
          </button>
        </div>
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interests.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => removeInterest(tag)}
                  className="text-indigo-400 hover:text-indigo-600 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "保存中..." : saved ? "保存しました" : "設定を保存する"}
      </button>
    </div>
  );
}
