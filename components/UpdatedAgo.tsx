"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 30_000;

// A clock that ticks every 30 s, so "x min ago" stays current without
// reading Date.now() during render.
function subscribeClock(notify: () => void) {
  const id = window.setInterval(notify, TICK_MS);
  return () => window.clearInterval(id);
}
const getTick = () => Math.floor(Date.now() / TICK_MS);
const getServerTick = () => 0;

/** "just now", "12 min ago", "2 h ago", "1 h 20 min ago". */
export function formatAge(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h ago` : `${h} h ${m} min ago`;
}

export default function UpdatedAgo({
  observedAt,
  refreshing,
  failed,
  onRefresh,
}: {
  /** Unix seconds of the weather observation. */
  observedAt: number;
  refreshing: boolean;
  failed: boolean;
  onRefresh: () => void;
}) {
  const tick = useSyncExternalStore(subscribeClock, getTick, getServerTick);
  if (tick === 0) return null;

  const minutes = Math.max(0, Math.floor((tick * TICK_MS) / 60_000 - observedAt / 60));
  const text = refreshing
    ? "Updating…"
    : failed
      ? `Update failed · ${formatAge(minutes)}`
      : `Updated ${formatAge(minutes)}`;

  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={refreshing}
      aria-label={`${text}. Refresh now`}
      title="Refresh now"
      className={`inline-flex items-center gap-1.5 uppercase tracking-widest hover:opacity-70 transition-opacity disabled:opacity-60 ${
        failed && !refreshing ? "text-[#FF3030]" : ""
      }`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
        className={refreshing ? "animate-spin" : ""}
      >
        <path d="M21 12a9 9 0 11-3-6.7M21 3v6h-6" />
      </svg>
      {text}
    </button>
  );
}
