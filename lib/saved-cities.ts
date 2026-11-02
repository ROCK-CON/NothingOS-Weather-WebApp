// Saved ("favourite") cities, kept in this browser's localStorage.
// Exposed as a tiny external store for React's useSyncExternalStore.

const KEY = "savedCities";
const MAX_SAVED = 8;
const EMPTY = "[]";

const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? EMPTY;
  } catch {
    return EMPTY; // storage blocked (private browsing etc.)
  }
}

/** Parse the stored JSON defensively — it lives in the browser and could be anything. */
export function parseSaved(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter((c): c is string => typeof c === "string" && c.length > 0 && c.length <= 100)
      .slice(0, MAX_SAVED);
  } catch {
    return [];
  }
}

function write(cities: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cities.slice(0, MAX_SAVED)));
  } catch {
    // ignore — saving is a convenience
  }
  listeners.forEach((notify) => notify());
}

export function subscribeSaved(notify: () => void): () => void {
  listeners.add(notify);
  // Keep other open tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

/** Snapshot is the raw string so React can compare it cheaply. */
export const getSavedSnapshot = read;
export const getSavedServerSnapshot = () => EMPTY;

/** Same city regardless of spacing/case, e.g. "Hobart, AU" vs "hobart,au". */
export function cityKey(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "");
}

export function toggleSaved(city: string) {
  const saved = parseSaved(read());
  const key = cityKey(city);
  const exists = saved.some((c) => cityKey(c) === key);
  if (!exists && saved.length >= MAX_SAVED) return; // the UI disables saving when full
  write(exists ? saved.filter((c) => cityKey(c) !== key) : [...saved, city]);
}

export const MAX_SAVED_CITIES = MAX_SAVED;
