"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import WeatherIcon from "./WeatherIcon";
import type { HourlyForecastItem } from "@/lib/weather";

interface HourlyForecastProps {
  data: HourlyForecastItem[];
}

function HourlyItem({
  item,
  index,
  isNow,
}: {
  item: HourlyForecastItem;
  index: number;
  isNow: boolean;
}) {
  const formatHour = (unix: number) => {
    if (isNow) return "Now";
    return new Date(unix * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      hour12: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      className={`relative flex flex-col items-center gap-3 px-4 py-5 rounded-2xl min-w-[76px] flex-shrink-0 transition-all duration-200 ${
        isNow
          ? "bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 shadow-sm"
          : "bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10"
      }`}
    >
      {/* Red accent bar for current hour */}
      {isNow && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-[#FF3030]" />
      )}

      <span
        className={`text-[11px] font-mono uppercase tracking-wider ${
          isNow ? "text-[#FF3030]" : "text-[#555555] dark:text-[#8A8A8A]"
        }`}
      >
        {formatHour(item.time)}
      </span>

      <WeatherIcon condition={item.condition} size={32} />

      <span className="text-black dark:text-white text-sm font-mono font-bold">
        {item.temperature}°
      </span>

      {item.precipitation > 0 ? (
        <span className="flex items-center gap-1 text-[#FF3030] text-[10px] font-mono">
          <svg width="5" height="7" viewBox="0 0 5 7" fill="currentColor">
            <path d="M2.5 0C2.5 0 0 3.5 0 4.8C0 6.0 1.1 7 2.5 7C3.9 7 5 6.0 5 4.8C5 3.5 2.5 0 2.5 0Z" />
          </svg>
          {Math.round(item.precipitation)}%
        </span>
      ) : (
        <span className="h-[14px]" />
      )}
    </motion.div>
  );
}

export default function HourlyForecast({ data }: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="w-full"
    >
      <h2 className="text-[#555555] dark:text-[#8A8A8A] text-xs font-mono uppercase tracking-widest mb-4">
        Hourly Forecast
      </h2>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scroll-hidden pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {data.slice(0, 24).map((item, i) => (
          <div key={item.time} style={{ scrollSnapAlign: "start" }}>
            <HourlyItem item={item} index={i} isNow={i === 0} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
