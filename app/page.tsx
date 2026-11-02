"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LocationSearch from "@/components/LocationSearch";
import WeatherCard from "@/components/WeatherCard";
import HourlyForecast from "@/components/HourlyForecast";
import WeeklyForecast from "@/components/WeeklyForecast";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ThemeToggle from "@/components/ThemeToggle";
import DigitalClock from "@/components/DigitalClock";
import { SunriseSunsetCard, WeatherDetailsCards } from "@/components/WeatherInfoCards";
import { formatLocalDate, type WeatherBundle, type WeatherQuery } from "@/lib/weather";
import { fetchWeather } from "@/lib/weather-client";

const DEFAULT_CITY = "Hobart,AU";
const LAST_CITY_KEY = "lastCity";

// localStorage can throw (private browsing, blocked storage) — never let that break the page.
function readLastCity(): string | null {
  try {
    return localStorage.getItem(LAST_CITY_KEY);
  } catch {
    return null;
  }
}

function writeLastCity(city: string | null) {
  try {
    if (city) localStorage.setItem(LAST_CITY_KEY, city);
    else localStorage.removeItem(LAST_CITY_KEY);
  } catch {
    // ignore
  }
}

export default function Home() {
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  /** Fetch and store weather. Only touches state after the request settles. */
  const fetchInto = useCallback(async (query: WeatherQuery) => {
    // Cancel any in-flight lookup so a slow earlier response can't overwrite a newer one.
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const data = await fetchWeather(query, controller.signal);
      if (controller.signal.aborted) return;
      setBundle(data);
      // Remember explicit city searches; a location lookup clears the preference.
      writeLastCity(
        "city" in query ? `${data.current.city},${data.current.country}` : null
      );
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Could not load weather data");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  /** User-initiated lookup: show the skeleton, clear any old error, then fetch. */
  const load = useCallback(
    (query: WeatherQuery) => {
      setLoading(true);
      setError(null);
      fetchInto(query);
    },
    [fetchInto]
  );

  /** Look up the device location; if that isn't possible, use `fallbackCity` (if given). */
  const locate = useCallback(
    (fallbackCity?: string) => {
      const fail = (message: string) => {
        setIsLocating(false);
        if (fallbackCity) load({ city: fallbackCity });
        else setError(message);
      };

      if (!navigator.geolocation) {
        fail("Geolocation is not supported by your browser");
        return;
      }
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          load({ lat: position.coords.latitude, lon: position.coords.longitude });
        },
        () => fail("Location access denied or unavailable"),
        { timeout: 10000, maximumAge: 300000 }
      );
    },
    [load]
  );

  // First load: last searched city → device location (if already permitted) → default city.
  // State already starts as "loading", so this only needs to fetch.
  useEffect(() => {
    const lastCity = readLastCity();
    if (lastCity || !navigator.permissions) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchInto only sets state after the request settles
      fetchInto({ city: lastCity ?? DEFAULT_CITY });
    } else {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) =>
          result.state === "granted" ? locate(DEFAULT_CITY) : fetchInto({ city: DEFAULT_CITY })
        )
        .catch(() => fetchInto({ city: DEFAULT_CITY }));
    }
    return () => requestRef.current?.abort();
  }, [fetchInto, locate]);

  const handleCityChange = useCallback((city: string) => load({ city }), [load]);
  const handleGeolocate = useCallback(() => locate(), [locate]);

  const weather = bundle?.current ?? null;
  // The observation time (minutes old at most) gives the location's current date.
  const dateLabel = weather ? formatLocalDate(weather.dt, weather.timezoneOffset) : "";

  return (
    <main className="min-h-screen bg-[#f5f5f5] dark:bg-black dot-matrix transition-colors duration-300">
      <div className="mx-auto max-w-md lg:max-w-4xl min-h-screen px-5 py-8 flex flex-col gap-6">
        {/* Top section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-4">
            <LocationSearch
              currentCity={weather?.city ?? "—"}
              onCityChange={handleCityChange}
              onGeolocate={handleGeolocate}
              isLocating={isLocating}
            />
            <ThemeToggle />
          </div>
          <p className="text-[#555555] dark:text-[#8A8A8A] font-mono text-xs tracking-widest uppercase min-h-4">
            {dateLabel}
            {bundle?.mock && (
              <span className="ml-3 text-[#FF3030]">· Demo data (no API key)</span>
            )}
          </p>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass rounded-xl px-4 py-3 text-xs font-mono text-[#555555] dark:text-[#8A8A8A] flex items-center gap-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ) : bundle && weather ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/*
                Unified CSS Grid — 1 column on mobile, 2 columns on desktop.

                Mobile: items stack in `order-*` sequence:
                  1 Clock → 2 Weather → 3 Hourly → 4 5-Day → 5 Sunrise/Sunset → 6 Details

                Desktop (lg): items explicitly placed with col-start / row-start:
                  Row 1: WeatherCard (col 1)   | Clock (col 2)   — self-start
                  Row 2: SunriseSunset (col 1) | Hourly (col 2)  — stretch (Hourly sets height)
                  Row 3: DetailCards (col 1)   | 5-Day (col 2)   — stretch
              */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── Clock ── mobile 1 · desktop col 2, row 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="order-1 lg:col-start-2 lg:row-start-1 lg:self-start"
                >
                  <DigitalClock timezoneOffset={weather.timezoneOffset} />
                </motion.div>

                {/* ── Weather card ── mobile 2 · desktop col 1, row 1 */}
                <div className="order-2 lg:col-start-1 lg:row-start-1 lg:self-start">
                  <WeatherCard data={weather} />
                </div>

                {/* ── Hourly forecast ── mobile 3 · desktop col 2, row 2 */}
                <div className="order-3 lg:col-start-2 lg:row-start-2">
                  <HourlyForecast data={bundle.hourly} timezoneOffset={weather.timezoneOffset} />
                </div>

                {/* ── 5-Day forecast ── mobile 4 · desktop col 2, row 3 */}
                {/* Direct grid child: align-self:stretch fills the row height set by the left column */}
                <WeeklyForecast
                  data={bundle.daily}
                  className="order-4 lg:col-start-2 lg:row-start-3"
                />

                {/* ── Sunrise & Sunset ── mobile 5 · desktop col 1, row 2 */}
                <div className="order-5 lg:col-start-1 lg:row-start-2">
                  <SunriseSunsetCard
                    sunrise={weather.sunrise}
                    sunset={weather.sunset}
                    now={weather.dt}
                    timezoneOffset={weather.timezoneOffset}
                  />
                </div>

                {/* ── Detail cards ── mobile 6 · desktop col 1, row 3 */}
                {/* Direct grid child: align-self:stretch gives it a definite height so flex-1 on AQ works */}
                <WeatherDetailsCards
                  data={weather}
                  className="order-6 lg:col-start-1 lg:row-start-3"
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-auto pt-4 flex items-center justify-between"
        >
          <span className="text-black/10 dark:text-white/10 font-mono text-[10px] uppercase tracking-widest">
            Nothing Weather
          </span>
          <span className="text-black/10 dark:text-white/10 font-mono text-[10px]">
            {weather && `${weather.city}, ${weather.country}`}
          </span>
        </motion.div>
      </div>
    </main>
  );
}
