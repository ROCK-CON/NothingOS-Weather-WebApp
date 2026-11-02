import type { WeatherBundle, WeatherQuery } from "./weather";

/** Fetch weather from our own API route. Throws with a user-facing message on failure. */
export async function fetchWeather(
  query: WeatherQuery,
  signal?: AbortSignal
): Promise<WeatherBundle> {
  const params = new URLSearchParams(
    "city" in query
      ? { city: query.city }
      : { lat: query.lat.toFixed(2), lon: query.lon.toFixed(2) }
  );
  const res = await fetch(`/api/weather?${params}`, { signal });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? `Weather request failed (${res.status})`);
  }
  return body as WeatherBundle;
}
