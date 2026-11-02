"use client";

import { useSyncExternalStore } from "react";
import { formatLocalTime } from "@/lib/weather";

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

/**
 * "Checked just now · reading 13:05"
 *
 * Two different times, on purpose:
 * - Checked: when this page last asked for new data. Resets on every refresh,
 *   so tapping always visibly does something.
 * - Reading: when OpenWeatherMap took the observation (location's local time).
 *   This only moves when a newer reading exists — roughly every 10 minutes,
 *   since the server caches each city for 10 minutes to protect the free quota.
 */
export default function UpdatedAgo({
  checkedAt,
  observedAt,
  timezoneOffset,
  refreshing,
  failed,
  onRefresh,
}: {
  /** Milliseconds: last successful check. */
  checkedAt: number;
  /** Unix seconds: when the observation was taken. */
  observedAt: number;
  /** Location's offset from UTC in seconds. */
  timezoneOffset: number;
  refreshing: boolean;
  failed: boolean;
  onRefresh: () => void;
}) {
  const tick = useSyncExternalStore(subscribeClock, getTick, getServerTick);
  if (tick === 0) return null;

  // The clock only ticks every 30 s; never show a check as being in the future.
  const nowMs = Math.max(tick * TICK_MS, checkedAt);
  const checkedMin = Math.floor((nowMs - checkedAt) / 60_000);
  const reading = `reading ${formatLocalTime(observedAt, timezoneOffset)}`;

  const text = refreshing
    ? "Checking…"
    : failed
      ? `Update failed · tap to retry`
      : `Checked ${formatAge(checkedMin)}`;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        aria-live="polite"
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
      <span title="When the weather station reading was taken (local time)">{reading}</span>
    </span>
  );
}
