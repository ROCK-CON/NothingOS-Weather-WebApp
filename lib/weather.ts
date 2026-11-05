// Shared weather types and pure helpers.
//
// This module deliberately has no imports so it can run unchanged in the
// browser, in the API route, and directly under `node --test`.

// ─── App types ────────────────────────────────────────────────────────────────

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "partly-cloudy"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "mist"
  | "drizzle";

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  condition: WeatherCondition;
  humidity: number;
  /** km/h */
  windSpeed: number;
  /** km/h, or null when OpenWeatherMap doesn't report gusts (common in light winds). */
  windGust: number | null;
  windDeg: number;
  /** metres */
  visibility: number;
  pressure: number;
  icon: string;
  sunrise: number;
  sunset: number;
  dt: number;
  /** OpenWeatherMap air quality index 1–5, or null when unavailable. */
  aqi: number | null;
  lat: number;
  lon: number;
  /** Seconds east of UTC for the location. */
  timezoneOffset: number;
}

export interface HourlyForecastItem {
  time: number;
  temperature: number;
  condition: WeatherCondition;
  icon: string;
  description: string;
  /** Chance of precipitation, 0–100. */
  precipitation: number;
  /** Expected rain + snow for this 3-hour block, in mm (0 when none). */
  amount: number;
  /** True when most of `amount` is snow. */
  snow: boolean;
  /** km/h */
  windSpeed: number;
  /** km/h, or null when not reported. */
  gust: number | null;
}

export interface DailyForecastItem {
  date: number;
  dayName: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  icon: string;
  description: string;
  /** Highest chance of precipitation during the day, 0–100. */
  precipitation: number;
  /** Day's total expected rain + snow, in mm. */
  amount: number;
  /** True when most of `amount` is snow. */
  snow: boolean;
  /** The day's 3-hourly forecast points (only those still to come for today). */
  hours: HourlyForecastItem[];
}

export interface WeatherBundle {
  current: WeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  /** True only for local development sample data. */
  mock?: boolean;
}

export type WeatherQuery = { city: string } | { lat: number; lon: number };

// ─── OpenWeatherMap response shapes (only the fields we use) ─────────────────

interface OwmCondition {
  id: number;
  description: string;
  icon: string;
}

export interface OwmCurrent {
  name: string;
  dt: number;
  timezone: number;
  visibility?: number;
  coord: { lat: number; lon: number };
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  wind?: { speed?: number; deg?: number; gust?: number };
  sys: { country?: string; sunrise: number; sunset: number };
  weather: OwmCondition[];
}

export interface OwmForecastItem {
  dt: number;
  main: { temp: number };
  weather: OwmCondition[];
  pop?: number;
  wind?: { speed?: number; gust?: number };
  rain?: { "3h"?: number };
  snow?: { "3h"?: number };
}

export interface OwmForecast {
  list: OwmForecastItem[];
}

export interface OwmAir {
  list?: Array<{ main?: { aqi?: number } }>;
}

// ─── Query validation ────────────────────────────────────────────────────────

const MAX_CITY_LENGTH = 100;
// Letters (any language), spaces and the punctuation real place names use,
// e.g. "Melbourne,AU", "St. John's", "Saint-Étienne".
const CITY_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.,'’-]*$/u;

/** Validate `?city=` or `?lat=&lon=` search params. Returns an error message on failure. */
export function parseWeatherQuery(params: URLSearchParams): WeatherQuery | { error: string } {
  const rawCity = params.get("city");
  if (rawCity !== null) {
    const city = rawCity.trim().replace(/\s+/g, " ");
    if (!city) return { error: "City is required" };
    if (city.length > MAX_CITY_LENGTH) return { error: "City name is too long" };
    if (!CITY_PATTERN.test(city)) return { error: "City name contains invalid characters" };
    return { city };
  }

  const rawLat = params.get("lat");
  const rawLon = params.get("lon");
  const lat = Number(rawLat);
  const lon = Number(rawLon);
  if (
    !rawLat ||
    !rawLon ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) {
    return { error: "A city or valid coordinates are required" };
  }
  // ~1 km precision: plenty for weather, improves caching, and avoids passing
  // the visitor's exact position upstream.
  return { lat: roundTo(lat, 2), lon: roundTo(lon, 2) };
}

function roundTo(value: number, places: number): number {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}

// ─── Time helpers (always in the location's timezone, never the device's) ────

/** Shift a unix timestamp into the location's local time. Read it back with getUTC* methods only. */
export function toLocalDate(unix: number, offsetSec: number): Date {
  return new Date((unix + offsetSec) * 1000);
}

/** "HH:MM" (or "HH" when `withMinutes` is false) in the location's local time. */
export function formatLocalTime(unix: number, offsetSec: number, withMinutes = true): string {
  return toLocalDate(unix, offsetSec).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: withMinutes ? "2-digit" : undefined,
    hourCycle: "h23", // `hour12: false` renders midnight as "24" in some browsers
    timeZone: "UTC",
  });
}

/** e.g. "Monday 2 November" in the location's local time. */
export function formatLocalDate(unix: number, offsetSec: number): string {
  return toLocalDate(unix, offsetSec).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function localDayKey(unix: number, offsetSec: number): string {
  return toLocalDate(unix, offsetSec).toISOString().slice(0, 10);
}

function localHour(unix: number, offsetSec: number): number {
  return toLocalDate(unix, offsetSec).getUTCHours();
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function mapCondition(weatherId: number): WeatherCondition {
  if (weatherId >= 200 && weatherId < 300) return "thunderstorm";
  if (weatherId >= 300 && weatherId < 400) return "drizzle";
  if (weatherId >= 500 && weatherId < 600) return "rain";
  if (weatherId >= 600 && weatherId < 700) return "snow";
  if (weatherId >= 700 && weatherId < 800) return "mist";
  if (weatherId === 801 || weatherId === 802) return "partly-cloudy";
  if (weatherId >= 803) return "cloudy";
  return "clear";
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toPercent(pop: number | undefined): number {
  return Math.round((pop ?? 0) * 100);
}

/** m/s → km/h, rounded. */
function toKmh(ms: number): number {
  return Math.round(ms * 3.6);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** OpenWeatherMap icon codes end in "n" at night, e.g. "01n". */
export function isNightIcon(icon: string): boolean {
  return icon.endsWith("n");
}

/** "<1 mm", "2.4 mm", "12 mm" — or "" when there's nothing to show. */
export function formatAmount(mm: number): string {
  if (!(mm > 0)) return "";
  if (mm < 1) return "<1 mm";
  if (mm < 10) return `${mm.toFixed(1)} mm`;
  return `${Math.round(mm)} mm`;
}

/**
 * Gusts are worth calling out when they're both strong and well above the
 * average wind — otherwise they're just noise in the hourly view.
 */
export function isNotableGust(windSpeed: number, gust: number | null): gust is number {
  return gust !== null && gust >= 30 && gust >= windSpeed * 1.5;
}

function toHourlyItem(item: OwmForecastItem): HourlyForecastItem {
  const w = item.weather[0];
  const rain = item.rain?.["3h"] ?? 0;
  const snow = item.snow?.["3h"] ?? 0;
  return {
    time: item.dt,
    temperature: Math.round(item.main.temp),
    condition: mapCondition(w.id),
    icon: w.icon,
    description: w.description,
    precipitation: toPercent(item.pop),
    amount: round1(rain + snow),
    snow: snow > rain,
    windSpeed: toKmh(item.wind?.speed ?? 0),
    gust: typeof item.wind?.gust === "number" ? toKmh(item.wind.gust) : null,
  };
}

/** AQI 1–5 from the Air Pollution API, or null if missing/invalid. */
export function aqiFromAir(air: OwmAir | null): number | null {
  const aqi = air?.list?.[0]?.main?.aqi;
  return typeof aqi === "number" && aqi >= 1 && aqi <= 5 ? aqi : null;
}

export function parseCurrent(data: OwmCurrent, aqi: number | null): WeatherData {
  const w = data.weather[0];
  return {
    city: data.name,
    country: data.sys.country ?? "",
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: capitalise(w.description),
    condition: mapCondition(w.id),
    humidity: data.main.humidity,
    windSpeed: toKmh(data.wind?.speed ?? 0),
    windGust: typeof data.wind?.gust === "number" ? toKmh(data.wind.gust) : null,
    windDeg: data.wind?.deg ?? 0,
    visibility: data.visibility ?? 10000,
    pressure: data.main.pressure,
    icon: w.icon,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    dt: data.dt,
    aqi,
    lat: data.coord.lat,
    lon: data.coord.lon,
    timezoneOffset: data.timezone,
  };
}

/**
 * "Now" followed by the next `slots` forecast points. The free forecast is in
 * 3-hour steps, so the default 8 slots covers the next 24 hours.
 */
export function parseHourly(
  forecast: OwmForecast,
  current: WeatherData,
  slots = 8
): HourlyForecastItem[] {
  const upcoming = forecast.list
    .filter((item) => item.dt > current.dt)
    .slice(0, slots)
    .map(toHourlyItem);
  const next = upcoming[0];
  // "Now" shows current conditions; rain chance and amount come from the next
  // 3-hour block, since there's no "current" precipitation forecast.
  const now: HourlyForecastItem = {
    time: current.dt,
    temperature: current.temperature,
    condition: current.condition,
    icon: current.icon,
    description: current.description,
    precipitation: next?.precipitation ?? 0,
    amount: next?.amount ?? 0,
    snow: next?.snow ?? false,
    windSpeed: current.windSpeed,
    gust: current.windGust,
  };
  return [now, ...upcoming];
}

/** Group 3-hourly points into calendar days in the location's timezone. */
export function parseDaily(
  forecast: OwmForecast,
  current: WeatherData,
  maxDays = 6
): DailyForecastItem[] {
  const offset = current.timezoneOffset;
  const todayKey = localDayKey(current.dt, offset);

  const groups = new Map<string, OwmForecastItem[]>();
  for (const item of forecast.list) {
    const key = localDayKey(item.dt, offset);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }

  const days: DailyForecastItem[] = [];
  for (const [key, items] of groups) {
    if (days.length >= maxDays) break;
    const isToday = key === todayKey;

    const temps = items.map((item) => item.main.temp);
    if (isToday) temps.push(current.temperature);

    // Represent the day by the point closest to midday.
    const midday = items.reduce((best, item) =>
      Math.abs(localHour(item.dt, offset) - 12) < Math.abs(localHour(best.dt, offset) - 12)
        ? item
        : best
    );
    const w = midday.weather[0];
    const hours = items.filter((item) => item.dt > current.dt).map(toHourlyItem);
    const rain = items.reduce((sum, item) => sum + (item.rain?.["3h"] ?? 0), 0);
    const snow = items.reduce((sum, item) => sum + (item.snow?.["3h"] ?? 0), 0);

    days.push({
      date: midday.dt,
      dayName: isToday ? "Today" : DAY_NAMES[toLocalDate(midday.dt, offset).getUTCDay()],
      high: Math.round(Math.max(...temps)),
      low: Math.round(Math.min(...temps)),
      condition: isToday ? current.condition : mapCondition(w.id),
      icon: isToday ? current.icon : w.icon,
      description: isToday ? current.description : w.description,
      precipitation: toPercent(Math.max(...items.map((item) => item.pop ?? 0))),
      amount: round1(rain + snow),
      snow: snow > rain,
      hours,
    });
  }
  return days;
}

/**
 * Line the days up with the real clock. Forecast data can be minutes old (the
 * CDN cache) or a page can sit open past midnight, so "Today" is decided at
 * display time: days already over are dropped, labels are recalculated, and
 * forecast points already in the past are removed.
 */
export function daysFromNow(
  daily: DailyForecastItem[],
  nowSec: number,
  offsetSec: number
): DailyForecastItem[] {
  const todayKey = localDayKey(nowSec, offsetSec);
  return daily
    .filter((day) => localDayKey(day.date, offsetSec) >= todayKey)
    .map((day) => ({
      ...day,
      dayName:
        localDayKey(day.date, offsetSec) === todayKey
          ? "Today"
          : DAY_NAMES[toLocalDate(day.date, offsetSec).getUTCDay()],
      hours: day.hours.filter((hour) => hour.time > nowSec),
    }));
}
