"use client";
import { useState, useRef, useEffect } from "react";
import type { Group } from "@/types";

type Props = {
  groups: Group[];
  activeGroupId: string;
};

export default function GroupSwitcher({ groups, activeGroupId }: Props) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function switchGroup(groupId: string) {
    if (groupId === activeGroupId || switching) return;
    setSwitching(true);
    setOpen(false);
    await fetch("/api/group/active", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });
    window.location.href = "/home";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={switching}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors disabled:opacity-50"
      >
        <span>{switching ? "切替中..." : (activeGroup?.name ?? "グループ")}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider px-3 py-1">
            参加中のグループ
          </p>

          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => switchGroup(g.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-indigo-50 transition-colors"
            >
              <span className={g.id === activeGroupId ? "font-semibold text-indigo-700" : "text-gray-700"}>
                {g.name}
              </span>
              {g.id === activeGroupId && (
                <span className="text-indigo-500 text-xs">✓ 表示中</span>
              )}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-1">
            <a
              href="/setup"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-1.5 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <span>＋</span>
              <span>グループを作成 / 参加</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
