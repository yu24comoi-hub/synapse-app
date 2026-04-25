"use client";
import { useState } from "react";

type Props = {
  contentId: string;
  initialStocked: boolean;
  size?: "sm" | "md";
};

export default function StockButton({ contentId, initialStocked, size = "sm" }: Props) {
  const [stocked, setStocked] = useState(initialStocked);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const res = await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId }),
    });
    if (res.ok) {
      const { stocked: next } = await res.json();
      setStocked(next);
    }
    setLoading(false);
  }

  const iconSize = size === "md" ? "w-5 h-5" : "w-4 h-4";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={stocked ? "ストック済み（クリックで解除）" : "ストックする"}
      className={`transition-colors disabled:opacity-40 ${
        stocked ? "text-amber-500 hover:text-amber-400" : "text-gray-300 hover:text-amber-400"
      }`}
    >
      <svg className={iconSize} viewBox="0 0 24 24" fill={stocked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
}
