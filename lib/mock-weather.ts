import type { WeatherBundle, WeatherCondition, WeatherData } from "./weather";

const CONDITIONS: WeatherCondition[] = [
  "partly-cloudy",
  "cloudy",
  "rain",
  "partly-cloudy",
  "clear",
  "cloudy",
];
const ICONS = ["02d", "03d", "10d", "02d", "01d", "03d"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Deterministic sample data for local development when WEATHER_API_KEY isn't set.
 * The API route only serves this when NODE_ENV is "development" — never in production.
 */
export function mockBundle(label: string): WeatherBundle {
  const now = Math.floor(Date.now() / 1000);
  const tz = 36000; // UTC+10

  const current: WeatherData = {
    city: label.split(",")[0].trim(), // "Melbourne,AU" → "Melbourne", like the real API

    country: "AU",
    temperature: 22,
    feelsLike: 20,
    description: "Partly cloudy",
    condition: "partly-cloudy",
    humidity: 58,
    windSpeed: 14,
    windDeg: 275,
    visibility: 10000,
    pressure: 1015,
    icon: "02d",
    sunrise: now - 4 * 3600,
    sunset: now + 4 * 3600,
    dt: now,
    aqi: 2,
    lat: -37.81,
    lon: 144.96,
    timezoneOffset: tz,
  };

  const hourly = Array.from({ length: 9 }, (_, i) => ({
    time: now + i * 3 * 3600,
    temperature: Math.round(18 + Math.sin((i * Math.PI) / 4) * 5),
    condition: CONDITIONS[i % 6],
    icon: ICONS[i % 6],
    description: CONDITIONS[i % 6].replace("-", " "),
    precipitation: CONDITIONS[i % 6] === "rain" ? 80 : 0,
  }));

  const daily = Array.from({ length: 6 }, (_, i) => {
    const date = now + i * 86400;
    return {
      date,
      dayName: i === 0 ? "Today" : DAY_NAMES[new Date((date + tz) * 1000).getUTCDay()],
      high: 24 - (i % 3),
      low: 13 + (i % 2),
      condition: CONDITIONS[i % 6],
      icon: ICONS[i % 6],
      description: CONDITIONS[i % 6].replace("-", " "),
      precipitation: [0, 90, 40, 0, 70, 10][i],
    };
  });

  return { current, hourly, daily, mock: true };
}
