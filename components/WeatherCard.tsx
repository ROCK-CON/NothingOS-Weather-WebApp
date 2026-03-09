"use client";

import { motion } from "framer-motion";
import WeatherIcon from "./WeatherIcon";
import type { WeatherData } from "@/lib/weather";

interface WeatherCardProps {
  data: WeatherData;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[#555555] dark:text-[#8A8A8A] text-xs uppercase tracking-widest">
        {label}
      </span>
      <span className="text-black dark:text-white text-sm font-mono">{value}</span>
    </div>
  );
}

export default function WeatherCard({ data }: WeatherCardProps) {
  const formatTime = (unix: number) => {
    return new Date(unix * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      {/* Main temperature display */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-start"
          >
            <span className="text-[96px] font-mono font-bold text-black dark:text-white leading-none tracking-tighter">
              {data.temperature}
            </span>
            <span className="text-3xl font-mono text-[#555555] dark:text-[#8A8A8A] mt-4">°C</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#555555] dark:text-[#8A8A8A] font-mono text-sm mt-1"
          >
            Feels like {data.feelsLike}°C
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WeatherIcon condition={data.condition} size={72} />
        </motion.div>
      </div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-black dark:text-white font-mono text-lg mb-8 tracking-wide uppercase"
      >
        {data.description}
      </motion.p>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-5 grid grid-cols-2 gap-5"
      >
        <StatItem label="Humidity" value={`${data.humidity}%`} />
        <StatItem label="Wind" value={`${data.windSpeed} km/h`} />
        <StatItem
          label="Visibility"
          value={`${(data.visibility / 1000).toFixed(1)} km`}
        />
        <StatItem label="Pressure" value={`${data.pressure} hPa`} />
        <StatItem label="Sunrise" value={formatTime(data.sunrise)} />
        <StatItem label="Sunset" value={formatTime(data.sunset)} />
      </motion.div>
    </motion.div>
  );
}
