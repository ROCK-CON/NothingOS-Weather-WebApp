"use client";

import { motion } from "framer-motion";
import WeatherIcon from "./WeatherIcon";
import WeatherInfoCards from "./WeatherInfoCards";
import DigitalClock from "./DigitalClock";
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
      {/* Digital clock */}
      <DigitalClock />

      {/* Main temperature display */}
      <div className="flex items-center justify-between mb-4">
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
          <WeatherIcon condition={data.condition} size={180} />
        </motion.div>
      </div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-black dark:text-white font-mono text-lg mb-6 tracking-wide uppercase"
      >
        {data.description}
      </motion.p>

      {/* Infographic cards */}
      <WeatherInfoCards data={data} />
    </motion.div>
  );
}
