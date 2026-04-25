"use client";
import { useState, useEffect, useRef } from "react";
import type { AppNotification } from "@/lib/notifications";
import Link from "next/link";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setNotifs(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleOpen() {
    setOpen(!open);
    if (!open && unread > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  function formatTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "今";
    if (min < 60) return `${min}分前`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}時間前`;
    return `${Math.floor(h / 24)}日前`;
  }

  const itemContent = (n: AppNotification) => (
    <>
      {/* 各通知右上のベルアイコン */}
      <span className={`absolute top-2 right-2.5 ${!n.read ? "text-indigo-400" : "text-gray-200"}`}>
        <BellIcon className="w-3.5 h-3.5" />
      </span>
      <span className="mt-0.5 shrink-0 text-base">
        {n.type === "new_curation" ? "🧠" : "✅"}
      </span>
      <div className="min-w-0 pr-5">
        <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatTime(n.createdAt)}</p>
      </div>
    </>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-1 text-gray-400 hover:text-gray-700 transition-colors"
        title="通知"
      >
        <BellIcon className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">通知</p>
          </div>
          {notifs.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">通知はありません</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifs.map((n) => (
                <li key={n.id}>
                  {n.contentId ? (
                    <Link
                      href={`/content/${n.contentId}`}
                      onClick={() => setOpen(false)}
                      className={`relative flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? "bg-indigo-50/60" : ""}`}
                    >
                      {itemContent(n)}
                    </Link>
                  ) : (
                    <div className={`relative flex gap-3 px-4 py-3 ${!n.read ? "bg-indigo-50/60" : ""}`}>
                      {itemContent(n)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
