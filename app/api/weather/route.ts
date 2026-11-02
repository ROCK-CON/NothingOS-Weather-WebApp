import { NextRequest, NextResponse } from "next/server";
import {
  aqiFromAir,
  parseCurrent,
  parseDaily,
  parseHourly,
  parseWeatherQuery,
  type OwmAir,
  type OwmCurrent,
  type OwmForecast,
  type WeatherBundle,
} from "@/lib/weather";
import { mockBundle } from "@/lib/mock-weather";

const OWM_BASE = "https://api.openweathermap.org";
/** Weather changes slowly; caching for 10 minutes keeps us well inside the free-tier quota. */
const CACHE_SECONDS = 600;
const UPSTREAM_TIMEOUT_MS = 8000;

class UpstreamError extends Error {
  status: number;
  constructor(status: number) {
    super(`OpenWeatherMap responded with ${status}`);
    this.status = status;
  }
}

async function owm<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const url = new URL(path, OWM_BASE);
  for (const [key, value] of Object.entries({ ...params, units: "metric", appid: apiKey })) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url, {
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) throw new UpstreamError(res.status);
  return (await res.json()) as T;
}

function json(body: unknown, status: number, cacheable = false) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": cacheable
        ? `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`
        : "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const query = parseWeatherQuery(request.nextUrl.searchParams);
  if ("error" in query) return json({ error: query.error }, 400);

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      return json(mockBundle("city" in query ? query.city : "Your location"), 200);
    }
    console.error("WEATHER_API_KEY is not set");
    return json({ error: "Weather service is not configured" }, 500);
  }

  try {
    const current = await owm<OwmCurrent>(
      "/data/2.5/weather",
      "city" in query
        ? { q: query.city }
        : { lat: String(query.lat), lon: String(query.lon) },
      apiKey
    );
    const coords = { lat: String(current.coord.lat), lon: String(current.coord.lon) };
    const [forecast, air] = await Promise.all([
      owm<OwmForecast>("/data/2.5/forecast", coords, apiKey),
      // Air quality is a nice-to-have; don't fail the whole response without it.
      owm<OwmAir>("/data/2.5/air_pollution", coords, apiKey).catch(() => null),
    ]);

    const parsed = parseCurrent(current, aqiFromAir(air));
    const bundle: WeatherBundle = {
      current: parsed,
      hourly: parseHourly(forecast, parsed),
      daily: parseDaily(forecast, parsed),
    };
    return json(bundle, 200, true);
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 404) {
      return json({ error: "City not found" }, 404);
    }
    // Log details server-side only; never echo upstream errors (or the key) to the client.
    console.error("Weather lookup failed:", err instanceof Error ? err.message : err);
    return json({ error: "Weather service unavailable, try again shortly" }, 502);
  }
}
