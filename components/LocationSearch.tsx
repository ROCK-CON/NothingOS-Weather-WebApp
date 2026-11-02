"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationSearchProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  onGeolocate: () => void;
  isLocating: boolean;
  /** Whether the current city is in the saved list. */
  isSaved: boolean;
  /** False when the saved list is full (and this city isn't in it). */
  canSave: boolean;
  onToggleSave: () => void;
}

export default function LocationSearch({
  currentCity,
  onCityChange,
  onGeolocate,
  isLocating,
  isSaved,
  canSave,
  onToggleSave,
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
    <div className="w-full min-w-0">
      {/* Header with location and controls */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 group min-w-0"
          aria-expanded={isOpen}
          aria-controls="city-search"
          aria-label={`Current location: ${currentCity}. Change city`}
        >
          {/* Pin icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#FF3030] flex-shrink-0"
          >
            <path d="M12 22s-8-6.8-8-13a8 8 0 1116 0c0 6.2-8 13-8 13z" />
            <circle cx="12" cy="9" r="3" />
          </svg>
          <span className="truncate text-black dark:text-white font-mono text-sm uppercase tracking-widest hover:text-[#555555] dark:hover:text-[#8A8A8A] transition-colors">
            {currentCity}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`flex-shrink-0 text-[#555555] dark:text-[#8A8A8A] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.button>

        <div className="flex items-center gap-2 flex-shrink-0">
        {/* Save / unsave current city */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onToggleSave}
          disabled={!isSaved && !canSave}
          className="p-2 rounded-xl glass hover:opacity-70 transition-opacity disabled:opacity-30 text-black dark:text-white"
          aria-pressed={isSaved}
          aria-label={
            isSaved
              ? `Remove ${currentCity} from saved cities`
              : canSave
                ? `Save ${currentCity}`
                : "Saved cities list is full"
          }
          title={isSaved ? "Remove from saved" : canSave ? "Save city" : "Saved list is full (8)"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isSaved ? "#FF3030" : "none"}
            stroke={isSaved ? "#FF3030" : "currentColor"}
            strokeWidth="2"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
          </svg>
        </motion.button>

        {/* Geolocate button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onGeolocate}
          disabled={isLocating}
          className="p-2 rounded-xl glass hover:opacity-70 transition-opacity disabled:opacity-50 text-black dark:text-white"
          title="Use current location"
          aria-label={isLocating ? "Finding your location" : "Use current location"}
        >
          {isLocating ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
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
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          )}
        </motion.button>
        </div>
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
            id="city-search"
          >
            <form onSubmit={handleSubmit} className="flex gap-2" role="search">
              <input
                autoFocus
                type="text"
                aria-label="City name"
                maxLength={100}
                autoComplete="off"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search city..."
                className="flex-1 bg-transparent text-black dark:text-white font-mono text-sm placeholder-[#888] dark:placeholder-[#8A8A8A] outline-none border-b border-black/20 dark:border-white/20 pb-1 focus:border-black/50 dark:focus:border-white/50 transition-colors"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className="text-black dark:text-white font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
              >
                Go
              </motion.button>
            </form>

            {/* Quick suggestions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {["London", "New York", "Tokyo", "Sydney", "Paris"].map(
                (city) => (
                  <motion.button
                    type="button"
                    key={city}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onCityChange(city);
                      setIsOpen(false);
                    }}
                    className="text-[#555555] dark:text-[#8A8A8A] text-xs font-mono px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
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
