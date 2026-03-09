"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LocationSearch from "@/components/LocationSearch";
import WeatherCard from "@/components/WeatherCard";
import HourlyForecast from "@/components/HourlyForecast";
import WeeklyForecast from "@/components/WeeklyForecast";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ThemeToggle from "@/components/ThemeToggle";
import DigitalClock from "@/components/DigitalClock";
import WeatherInfoCards from "@/components/WeatherInfoCards";
import {
  getCurrentWeather,
  getForecast,
  getCurrentWeatherByCoords,
  getForecastByCoords,
  type WeatherData,
  type HourlyForecastItem,
  type DailyForecastItem,
} from "@/lib/weather";

const DEFAULT_CITY = "Melbourne";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function Home() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<HourlyForecastItem[]>([]);
  const [daily, setDaily] = useState<DailyForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeatherByCity = useCallback(async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(cityName),
        getForecast(cityName),
      ]);
      setWeather(weatherData);
      setHourly(forecastData.hourly);
      setDaily(forecastData.daily);
      setCity(weatherData.city);
    } catch {
      setError("Could not load weather data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLoading(true);
        setError(null);
        try {
          const [weatherData, forecastData] = await Promise.all([
            getCurrentWeatherByCoords(latitude, longitude),
            getForecastByCoords(latitude, longitude),
          ]);
          setWeather(weatherData);
          setHourly(forecastData.hourly);
          setDaily(forecastData.daily);
          setCity(weatherData.city);
        } catch {
          setError("Could not load weather for your location");
        } finally {
          setLoading(false);
          setIsLocating(false);
        }
      },
      () => {
        setError("Location access denied");
        setIsLocating(false);
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // Auto-geolocate on first load if permission already granted
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            handleGeolocate();
          } else {
            loadWeatherByCity(DEFAULT_CITY);
          }
        })
        .catch(() => {
          loadWeatherByCity(DEFAULT_CITY);
        });
    } else {
      loadWeatherByCity(DEFAULT_CITY);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCityChange = useCallback(
    (newCity: string) => {
      setCity(newCity);
      loadWeatherByCity(newCity);
    },
    [loadWeatherByCity]
  );

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
              currentCity={city}
              onCityChange={handleCityChange}
              onGeolocate={handleGeolocate}
              isLocating={isLocating}
            />
            <ThemeToggle />
          </div>
          <p className="text-[#555555] dark:text-[#8A8A8A] font-mono text-xs tracking-widest uppercase">
            {formatDate(new Date())}
          </p>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
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
          ) : weather ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:grid lg:grid-cols-2 lg:items-start gap-8"
            >
              {/* Row 1 left — weather header */}
              <WeatherCard data={weather} />

              {/* Row 1 right — digital clock */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <DigitalClock />
              </motion.div>

              {/* Row 2 left — infographic cards */}
              <WeatherInfoCards data={weather} />

              {/* Row 2 right — forecasts */}
              <div className="flex flex-col gap-8">
                <HourlyForecast data={hourly} />
                <WeeklyForecast data={daily} />
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
            {weather?.city && `${weather.city}, ${weather.country}`}
          </span>
        </motion.div>
      </div>
    </main>
  );
}
