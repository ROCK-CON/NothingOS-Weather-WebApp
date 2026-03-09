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
      {/* Temperature + Icon row */}
      <div className="flex items-start justify-between">
        {/* Left: temperature + feels like */}
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

        {/* Right: large icon + description stacked */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-end gap-3"
        >
          <WeatherIcon condition={data.condition} size={100} />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-black dark:text-white font-mono text-sm tracking-wide uppercase"
          >
            {data.description}
          </motion.span>
        </motion.div>
      </div>

    </motion.div>
  );
}
