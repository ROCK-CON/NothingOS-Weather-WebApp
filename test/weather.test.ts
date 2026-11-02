// Run with `npm test` (Node 22.18+ / 24 runs TypeScript directly).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aqiFromAir,
  formatLocalTime,
  mapCondition,
  parseCurrent,
  parseDaily,
  parseHourly,
  parseWeatherQuery,
  type OwmCurrent,
  type OwmForecast,
} from "../lib/weather.ts";

const HOUR = 3600;
const TOKYO = 9 * HOUR; // UTC+9

// 2026-11-02 21:00 UTC = 2026-11-03 06:00 in Tokyo (a Tuesday).
const NOW = Date.UTC(2026, 10, 2, 21, 0, 0) / 1000;

function current(overrides: Partial<OwmCurrent> = {}): OwmCurrent {
  return {
    name: "Tokyo",
    dt: NOW,
    timezone: TOKYO,
    visibility: 10000,
    coord: { lat: 35.68, lon: 139.69 },
    main: { temp: 14.6, feels_like: 13.2, humidity: 70, pressure: 1012 },
    wind: { speed: 5, deg: 90 },
    sys: { country: "JP", sunrise: NOW + 0.5 * HOUR, sunset: NOW + 11 * HOUR },
    weather: [{ id: 800, description: "clear sky", icon: "01d" }],
    ...overrides,
  };
}

/** 3-hourly forecast points starting 3h after NOW. */
function forecast(points = 40, pop = 0.35): OwmForecast {
  return {
    list: Array.from({ length: points }, (_, i) => ({
      dt: NOW + (i + 1) * 3 * HOUR,
      main: { temp: 10 + (i % 8) },
      weather: [{ id: 500, description: "light rain", icon: "10d" }],
      pop,
    })),
  };
}

test("mapCondition covers each OpenWeatherMap group", () => {
  assert.equal(mapCondition(211), "thunderstorm");
  assert.equal(mapCondition(301), "drizzle");
  assert.equal(mapCondition(501), "rain");
  assert.equal(mapCondition(601), "snow");
  assert.equal(mapCondition(741), "mist");
  assert.equal(mapCondition(800), "clear");
  assert.equal(mapCondition(802), "partly-cloudy");
  assert.equal(mapCondition(804), "cloudy");
});

test("formatLocalTime uses the location's timezone, and midnight is 00 not 24", () => {
  assert.equal(formatLocalTime(NOW, TOKYO), "06:00");
  const utcMidnight = Date.UTC(2026, 10, 3, 0, 0, 0) / 1000;
  assert.equal(formatLocalTime(utcMidnight, 0, false), "00");
});

test("parseCurrent converts units and keeps a null AQI", () => {
  const data = parseCurrent(current(), null);
  assert.equal(data.temperature, 15);
  assert.equal(data.windSpeed, 18); // 5 m/s → 18 km/h
  assert.equal(data.description, "Clear sky");
  assert.equal(data.aqi, null);
  assert.equal(data.timezoneOffset, TOKYO);
});

test("aqiFromAir accepts 1–5 only", () => {
  assert.equal(aqiFromAir({ list: [{ main: { aqi: 3 } }] }), 3);
  assert.equal(aqiFromAir({ list: [{ main: { aqi: 9 } }] }), null);
  assert.equal(aqiFromAir({}), null);
  assert.equal(aqiFromAir(null), null);
});

test("parseHourly returns Now + next 24h with precipitation as a percentage", () => {
  const cur = parseCurrent(current(), 1);
  const hourly = parseHourly(forecast(), cur);
  assert.equal(hourly.length, 9);
  assert.equal(hourly[0].time, NOW);
  assert.equal(hourly[1].time, NOW + 3 * HOUR);
  assert.equal(hourly[1].precipitation, 35);
  assert.equal(hourly[0].precipitation, 35); // "Now" borrows the next slot's chance
  assert.ok(hourly.slice(1).every((h) => h.time > NOW));
});

test("parseDaily groups by the location's calendar day and labels Today correctly", () => {
  const cur = parseCurrent(current(), 1);
  const daily = parseDaily(forecast(), cur);

  assert.equal(daily[0].dayName, "Today"); // Tue 3 Nov in Tokyo
  assert.equal(daily[1].dayName, "Wed");
  assert.equal(daily[2].dayName, "Thu");
  assert.ok(daily.length <= 6);
  assert.ok(daily.every((d) => d.precipitation === 35));
  // Today's range includes the current temperature (15).
  assert.ok(daily[0].high >= 15 && daily[0].low <= 15);
});

test("parseDaily does not label tomorrow as Today late in the evening", () => {
  // 14:30 UTC = 23:30 in Tokyo: every forecast point is already tomorrow.
  const late = Date.UTC(2026, 10, 2, 14, 30, 0) / 1000;
  const cur = parseCurrent(current({ dt: late }), 1);
  const list = Array.from({ length: 16 }, (_, i) => ({
    dt: late + (i + 1) * 3 * HOUR,
    main: { temp: 12 },
    weather: [{ id: 800, description: "clear sky", icon: "01n" }],
  }));
  const daily = parseDaily({ list }, cur);
  assert.notEqual(daily[0].dayName, "Today");
  assert.equal(daily[0].dayName, "Tue");
});

test("parseWeatherQuery validates and normalises input", () => {
  const q = (s: string) => parseWeatherQuery(new URLSearchParams(s));

  assert.deepEqual(q("city=%20Hobart,%20%20AU%20"), { city: "Hobart, AU" });
  assert.deepEqual(q("city=Saint-%C3%89tienne"), { city: "Saint-Étienne" });
  assert.deepEqual(q("lat=-42.88123&lon=147.32789"), { lat: -42.88, lon: 147.33 });

  assert.ok("error" in q("city="));
  assert.ok("error" in q("city=" + "a".repeat(101)));
  assert.ok("error" in q("city=%3Cscript%3E"));
  assert.ok("error" in q("lat=91&lon=0"));
  assert.ok("error" in q("lat=abc&lon=1"));
  assert.ok("error" in q("lat=1"));
  assert.ok("error" in q(""));
});
