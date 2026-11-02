"use client";

import { motion } from "framer-motion";
import { cityKey } from "@/lib/saved-cities";

/** One-tap chips for saved cities. Renders nothing until a city is saved. */
export default function SavedCities({
  cities,
  current,
  onSelect,
}: {
  /** Stored as "City,CC", e.g. "Hobart,AU". */
  cities: string[];
  /** "City,CC" of the city on screen, if any. */
  current: string | null;
  onSelect: (city: string) => void;
}) {
  if (cities.length === 0) return null;
  const currentKey = current ? cityKey(current) : null;

  return (
    <nav aria-label="Saved cities" className="flex gap-2 overflow-x-auto scroll-hidden -mx-1 px-1">
      {cities.map((city) => {
        const active = cityKey(city) === currentKey;
        return (
          <motion.button
            type="button"
            key={city}
            whileTap={{ scale: 0.95 }}
            onClick={() => !active && onSelect(city)}
            aria-current={active ? "true" : undefined}
            className={`flex-shrink-0 text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-lg transition-colors ${
              active
                ? "bg-[#FF3030]/15 text-[#FF3030]"
                : "bg-black/5 dark:bg-white/5 text-[#555555] dark:text-[#8A8A8A] hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
            }`}
          >
            {city.split(",")[0]}
          </motion.button>
        );
      })}
    </nav>
  );
}
