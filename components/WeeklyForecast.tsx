"use client";

import { motion } from "framer-motion";
import WeatherIcon from "./WeatherIcon";
import type { DailyForecastItem } from "@/lib/weather";

interface WeeklyForecastProps {
  data: DailyForecastItem[];
}

function DayRow({
  item,
  index,
  maxTemp,
  minTemp,
}: {
  item: DailyForecastItem;
  index: number;
  maxTemp: number;
  minTemp: number;
}) {
  const range = maxTemp - minTemp || 1;
  const barStart = ((item.low - minTemp) / range) * 100;
  const barWidth = ((item.high - item.low) / range) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.05, duration: 0.4 }}
      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
    >
      {/* Day name */}
      <span className="text-white font-mono text-sm w-12 flex-shrink-0 uppercase tracking-wide">
        {item.dayName}
      </span>

      {/* Icon */}
      <div className="w-8 flex-shrink-0 flex justify-center">
        <WeatherIcon condition={item.condition} size={28} />
      </div>

      {/* Precipitation */}
      <span className="text-[#8A8A8A] font-mono text-xs w-8 flex-shrink-0 text-right">
        {item.precipitation > 0 ? `${Math.round(item.precipitation)}%` : ""}
      </span>

      {/* Temperature bar */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-[#8A8A8A] font-mono text-xs w-8 text-right flex-shrink-0">
          {item.low}°
        </span>
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/70 rounded-full"
            style={{
              marginLeft: `${barStart}%`,
              width: `${Math.max(barWidth, 8)}%`,
            }}
          />
        </div>
        <span className="text-white font-mono text-xs w-8 flex-shrink-0">
          {item.high}°
        </span>
      </div>
    </motion.div>
  );
}

export default function WeeklyForecast({ data }: WeeklyForecastProps) {
  const maxTemp = Math.max(...data.map((d) => d.high));
  const minTemp = Math.min(...data.map((d) => d.low));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.5 }}
      className="w-full glass rounded-2xl p-5"
    >
      <h2 className="text-[#8A8A8A] text-xs font-mono uppercase tracking-widest mb-4">
        7-Day Forecast
      </h2>
      <div className="flex flex-col">
        {data.map((item, i) => (
          <DayRow
            key={item.date}
            item={item}
            index={i}
            maxTemp={maxTemp}
            minTemp={minTemp}
          />
        ))}
      </div>
    </motion.div>
  );
}
