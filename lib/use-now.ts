import { useSyncExternalStore } from "react";

const TICK_MS = 60_000;

// A clock that ticks every minute, so dates and day labels roll over at midnight
// without reading Date.now() during render.
function subscribeClock(notify: () => void) {
  const id = window.setInterval(notify, TICK_MS);
  return () => window.clearInterval(id);
}
const getTick = () => Math.floor(Date.now() / TICK_MS);
const getServerTick = () => 0;

/** The current time in unix seconds, accurate to the minute. */
export function useNowSeconds(): number {
  return useSyncExternalStore(subscribeClock, getTick, getServerTick) * (TICK_MS / 1000);
}
