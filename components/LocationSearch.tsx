"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationSearchProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  onGeolocate: () => void;
  isLocating: boolean;
}

export default function LocationSearch({
  currentCity,
  onCityChange,
  onGeolocate,
  isLocating,
}: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed) {
        onCityChange(trimmed);
        setInputValue("");
        setIsOpen(false);
      }
    },
    [inputValue, onCityChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setInputValue("");
    }
  };

  return (
    <div className="w-full">
      {/* Header with location and controls */}
      <div className="flex items-center justify-between mb-1">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 group"
        >
          {/* Pin icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#8A8A8A] group-hover:text-white transition-colors"
          >
            <path d="M12 22s-8-6.8-8-13a8 8 0 1116 0c0 6.2-8 13-8 13z" />
            <circle cx="12" cy="9" r="3" />
          </svg>
          <span className="text-white font-mono text-sm uppercase tracking-widest hover:text-[#8A8A8A] transition-colors">
            {currentCity}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-[#8A8A8A] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.button>

        {/* Geolocate button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onGeolocate}
          disabled={isLocating}
          className="p-2 rounded-xl glass hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Use current location"
        >
          {isLocating ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Search dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{ transformOrigin: "top" }}
            className="mt-3 glass rounded-2xl p-4"
          >
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search city..."
                className="flex-1 bg-transparent text-white font-mono text-sm placeholder-[#8A8A8A] outline-none border-b border-white/20 pb-1 focus:border-white/50 transition-colors"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className="text-white font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                Go
              </motion.button>
            </form>

            {/* Quick suggestions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {["London", "New York", "Tokyo", "Sydney", "Paris"].map(
                (city) => (
                  <motion.button
                    key={city}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onCityChange(city);
                      setIsOpen(false);
                    }}
                    className="text-[#8A8A8A] text-xs font-mono px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {city}
                  </motion.button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
