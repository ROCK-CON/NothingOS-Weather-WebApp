import type { HourlyForecastItem, WeatherBundle, WeatherCondition, WeatherData } from "./weather";

const CONDITIONS: WeatherCondition[] = [
  "partly-cloudy",
  "cloudy",
  "rain",
  "partly-cloudy",
  "clear",
  "cloudy",
];
const ICONS = ["02", "03", "10", "02", "01", "03"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR = 3600;

/**
 * Deterministic sample data for local development when WEATHER_API_KEY isn't set.
 * The API route only serves this when NODE_ENV is "development" — never in production.
 */
export function mockBundle(label: string): WeatherBundle {
  const now = Math.floor(Date.now() / 1000);
  const tz = 39600; // UTC+11 (Hobart, daylight saving)
  const sunrise = now - 4 * HOUR;
  const sunset = now + 4 * HOUR;
  const dayOrNight = (t: number) => {
    const sinceSunrise = (((t - sunrise) % 86400) + 86400) % 86400;
    return sinceSunrise < sunset - sunrise ? "d" : "n";
  };

  const current: WeatherData = {
    city: label.split(",")[0].trim(), // "Hobart,AU" → "Hobart", like the real API
    country: "AU",
    temperature: 17,
    feelsLike: 15,
    description: "Partly cloudy",
    condition: "partly-cloudy",
    humidity: 58,
    windSpeed: 22,
    windGust: 48,
    windDeg: 300,
    visibility: 10000,
    pressure: 1012,
    icon: "02d",
    sunrise,
    sunset,
    dt: now,
    aqi: 1,
    lat: -42.88,
    lon: 147.33,
    timezoneOffset: tz,
  };

  const point = (t: number, i: number): HourlyForecastItem => {
    const c = CONDITIONS[i % 6];
    return {
      time: t,
      temperature: Math.round(14 + Math.sin((i * Math.PI) / 4) * 4),
      condition: c,
      icon: `${ICONS[i % 6]}${dayOrNight(t)}`,
      description: c.replace("-", " "),
      precipitation: c === "rain" ? 80 : c === "cloudy" ? 30 : 0,
      amount: c === "rain" ? 3.4 : c === "cloudy" ? 0.4 : 0,
      snow: false,
      windSpeed: 20,
      gust: i % 3 === 0 ? 45 : 28,
    };
  };

  const upcoming = Array.from({ length: 40 }, (_, i) => point(now + (i + 1) * 3 * HOUR, i + 1));
  const hourly = [{ ...point(now, 0), icon: current.icon, gust: current.windGust }, ...upcoming.slice(0, 8)];

  const daily = Array.from({ length: 6 }, (_, i) => {
    const date = now + i * 86400;
    const hours = upcoming.slice(i * 8, i * 8 + 8);
    const amount = Math.round(hours.reduce((sum, h) => sum + h.amount, 0) * 10) / 10;
    return {
      date,
      dayName: i === 0 ? "Today" : DAY_NAMES[new Date((date + tz) * 1000).getUTCDay()],
      high: 19 - (i % 3),
      low: 9 + (i % 2),
      condition: CONDITIONS[i % 6],
      icon: `${ICONS[i % 6]}d`,
      description: CONDITIONS[i % 6].replace("-", " "),
      precipitation: [30, 90, 40, 0, 70, 10][i],
      amount: i === 3 ? 0 : amount,
      snow: i === 4, // one snowy day so the snowflake marker shows in demo mode
      hours,
    };
  });

  return { current, hourly, daily, mock: true };
}
