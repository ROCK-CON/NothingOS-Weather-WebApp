"use client";

import { motion } from "framer-motion";
import WeatherIcon from "./WeatherIcon";
import {
  formatAmount,
  formatLocalTime,
  isNightIcon,
  isNotableGust,
  type HourlyForecastItem,
} from "@/lib/weather";

interface HourlyForecastProps {
  data: HourlyForecastItem[];
  /** Location's offset from UTC in seconds, so times show in the city's local time. */
  timezoneOffset: number;
}

export function DropIcon() {
  return (
    <svg width="5" height="7" viewBox="0 0 5 7" fill="currentColor" aria-hidden="true">
      <path d="M2.5 0C2.5 0 0 3.5 0 4.8C0 6.0 1.1 7 2.5 7C3.9 7 5 6.0 5 4.8C5 3.5 2.5 0 2.5 0Z" />
    </svg>
  );
}

export function SnowflakeIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
      <path d="M4 0.5V7.5M1 2.25L7 5.75M1 5.75L7 2.25" />
    </svg>
  );
}

/**
 * One forecast column: time, icon, temperature, rain chance + amount, and
 * gusts when they're notable. Used by the Next 24 Hours strip and the
 * expanded day view in the 5-day forecast.
 */
export function ForecastSlot({
  item,
  label,
  highlight = false,
  index = 0,
}: {
  item: HourlyForecastItem;
  label: string;
  highlight?: boolean;
  index?: number;
}) {
  const amount = formatAmount(item.amount);
  const gust = isNotableGust(item.windSpeed, item.gust) ? item.gust : null;
  const precipLabel = [
    item.precipitation > 0 ? `${item.precipitation}% chance of ${item.snow ? "snow" : "rain"}` : "",
    amount ? amount.replace("<", "less than ") : "",
    gust ? `gusts ${gust} km/h` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl min-w-[72px] flex-shrink-0 transition-all duration-200 ${
        highlight ? "bg-white/5 dark:bg-white/8" : "hover:bg-black/5 dark:hover:bg-white/5"
      }`}
      aria-label={`${label}: ${item.temperature} degrees, ${item.description}${precipLabel ? `, ${precipLabel}` : ""}`}
    >
      {highlight && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-[#FF3030]" />
      )}

      <span
        className={`text-[11px] font-mono uppercase tracking-wider ${
          highlight ? "text-[#FF3030]" : "text-[#555555] dark:text-[#8A8A8A]"
        }`}
      >
        {label}
      </span>

      <WeatherIcon condition={item.condition} night={isNightIcon(item.icon)} size={32} />

      <span className="text-black dark:text-white text-sm font-mono font-bold">
        {item.temperature}°
      </span>

      {/* Rain chance, then amount underneath. Fixed heights keep columns aligned. */}
      <span className="flex items-center gap-1 text-[#FF3030] text-[10px] font-mono h-[14px]">
        {item.precipitation > 0 && (
          <>
            {item.snow ? <SnowflakeIcon /> : <DropIcon />}
            {item.precipitation}%
          </>
        )}
      </span>
      <span className="text-[#555555] dark:text-[#8A8A8A] text-[10px] font-mono h-[14px] -mt-2 whitespace-nowrap">
        {amount}
      </span>

      {/* Only shown when gusts are strong and well above the average wind */}
      <span className="text-[#555555] dark:text-[#8A8A8A] text-[10px] font-mono h-[14px] -mt-1 whitespace-nowrap">
        {gust ? `G ${gust}` : ""}
      </span>
    </motion.div>
  );
}

export default function HourlyForecast({ data, timezoneOffset }: HourlyForecastProps) {
  const showsGusts = data.some((item) => isNotableGust(item.windSpeed, item.gust));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="glass rounded-2xl p-5 w-full h-full flex flex-col"
    >
      <h2 className="text-[#555555] dark:text-[#8A8A8A] text-xs font-mono uppercase tracking-widest mb-4 flex-shrink-0">
        Next 24 Hours
      </h2>
      <div
        className="flex gap-1 overflow-x-auto scroll-hidden flex-1 items-center"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {data.map((item, i) => (
          <div key={item.time} style={{ scrollSnapAlign: "start" }}>
            <ForecastSlot
              item={item}
              index={i}
              highlight={i === 0}
              label={i === 0 ? "Now" : formatLocalTime(item.time, timezoneOffset, false)}
            />
          </div>
        ))}
      </div>
      {showsGusts && (
        <p className="text-[#555555] dark:text-[#8A8A8A] text-[10px] font-mono mt-2">
          G = wind gusts, km/h
        </p>
      )}
    </motion.div>
  );
}
