"use client";

import { motion } from "framer-motion";
import WeatherIcon from "./WeatherIcon";
import type { WeatherData } from "@/lib/weather";

interface WeatherCardProps {
  data: WeatherData;
}

export default function WeatherCard({ data }: WeatherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      {/* Row 1: Temperature (left) | Icon (right) — same visual height */}
      <div className="flex items-center justify-between">
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

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WeatherIcon condition={data.condition} size={112} />
        </motion.div>
      </div>

      {/* Row 2: "Feels like" (left) | Description (right) — same baseline */}
      <div className="flex items-center justify-between mt-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[#555555] dark:text-[#8A8A8A] font-mono text-sm"
        >
          Feels like {data.feelsLike}°C
        </motion.p>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-black dark:text-white font-mono text-sm tracking-wide uppercase"
        >
          {data.description}
        </motion.span>
      </div>
    </motion.div>
  );
}
