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
      className={`flex flex-col items-center gap-3 px-4 py-4 rounded-2xl min-w-[68px] flex-shrink-0 transition-colors ${
        isNow
          ? "bg-white/10 border border-white/20"
          : "bg-white/5 border border-white/5 hover:bg-white/8"
      }`}
    >
      <span className="text-[#8A8A8A] text-xs font-mono uppercase tracking-wider">
        {formatHour(item.time)}
      </span>
      <WeatherIcon condition={item.condition} size={28} />
      <span className="text-white text-sm font-mono font-bold">
        {item.temperature}°
      </span>
      {item.precipitation > 0 && (
        <span className="text-[#8A8A8A] text-[10px] font-mono">
          {Math.round(item.precipitation)}%
        </span>
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
      <h2 className="text-[#8A8A8A] text-xs font-mono uppercase tracking-widest mb-4">
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
