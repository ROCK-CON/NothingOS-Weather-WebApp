"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { DropIcon, SnowflakeIcon } from "./HourlyForecast";

// ─── Guide content ────────────────────────────────────────────────────────────
// Edit this list when features change. Each icon mirrors what's on screen, so
// the guide doubles as a key.

const RED = "#FF3030";

function Stroke({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={RED} stroke={RED} strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </svg>
);
const LocateIcon = () => (
  <Stroke>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </Stroke>
);
const RefreshIcon = () => (
  <Stroke>
    <path d="M21 12a9 9 0 11-3-6.7M21 3v6h-6" />
  </Stroke>
);
const ChevronIcon = () => (
  <Stroke>
    <polyline points="6 9 12 15 18 9" />
  </Stroke>
);
const MoonIcon = () => (
  <Stroke>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </Stroke>
);
const ThemeIcon = () => (
  <Stroke>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 000 18z" fill="currentColor" />
  </Stroke>
);
const PinIcon = () => (
  <Stroke>
    <path d="M12 22s-8-6.8-8-13a8 8 0 1116 0c0 6.2-8 13-8 13z" />
    <circle cx="12" cy="9" r="3" />
  </Stroke>
);

/** Small red text marker, styled exactly like it appears in the forecast. */
const Marker = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 text-[#FF3030] text-[10px] font-mono whitespace-nowrap">
    {children}
  </span>
);
const Muted = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#555555] dark:text-[#8A8A8A] text-[10px] font-mono whitespace-nowrap">{children}</span>
);

const GUIDE: Array<{ icon: React.ReactNode; text: React.ReactNode }> = [
  { icon: <PinIcon />, text: "Tap the city name to search for another city." },
  { icon: <StarIcon />, text: "Save a city with the star. Saved cities appear under the date for one-tap switching." },
  { icon: <LocateIcon />, text: "Show the weather where you are." },
  {
    icon: <RefreshIcon />,
    text: "“Checked” is when the page last looked for new data — tap to check now. “Reading” is when the station measured it; new readings arrive about every 10 minutes.",
  },
  {
    icon: (
      <Marker>
        <DropIcon />
        70%
      </Marker>
    ),
    text: (
      <>
        Chance of rain. <Muted>2.4 mm</Muted> underneath is the expected amount; on a day it&apos;s the day&apos;s total.
      </>
    ),
  },
  {
    icon: (
      <Marker>
        <SnowflakeIcon />
      </Marker>
    ),
    text: "Snow instead of rain.",
  },
  { icon: <Muted>G 45</Muted>, text: "Wind gusts in km/h, shown when they’re well above the average wind." },
  { icon: <ChevronIcon />, text: "Tap any day in the 5-day forecast for its 3-hourly breakdown." },
  { icon: <MoonIcon />, text: "Moon icons mean clear or partly cloudy at night." },
  { icon: <ThemeIcon />, text: "Switch between light and dark mode." },
];

// ─── Button + panel ───────────────────────────────────────────────────────────

/**
 * "?" button that opens the guide in a native <dialog>: a bottom sheet on
 * phones, a centred panel on larger screens. The browser handles focus,
 * Esc-to-close and screen-reader semantics.
 */
export default function HelpGuide() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => dialogRef.current?.showModal()}
        className="p-2 rounded-xl glass flex-shrink-0 text-black dark:text-white hover:opacity-70 transition-opacity"
        title="How to use"
        aria-label="How to use"
        aria-haspopup="dialog"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.6 9.4a2.5 2.5 0 014.8.9c0 1.7-2.4 2.2-2.4 3.7" />
          <line x1="12" y1="17.2" x2="12.01" y2="17.2" />
        </svg>
      </motion.button>

      <dialog
        ref={dialogRef}
        aria-labelledby="help-title"
        // A click on the dialog element itself (not its content) is the backdrop.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="p-0 bg-transparent text-black dark:text-white backdrop:bg-black/60 backdrop:backdrop-blur-sm
          w-full max-w-none max-h-[85dvh] m-0 mt-auto
          sm:m-auto sm:max-w-md sm:max-h-[80vh]"
      >
        <div
          className="motion-safe:animate-sheet-in font-mono bg-[#f5f5f5] dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10
            rounded-t-3xl sm:rounded-3xl px-6 pt-5 pb-8 sm:pb-6 max-h-[85dvh] sm:max-h-[80vh] overflow-y-auto"
        >
          {/* Grab handle (phones) */}
          <div className="sm:hidden mx-auto mb-4 h-1 w-10 rounded-full bg-black/15 dark:bg-white/15" aria-hidden="true" />

          <div className="flex items-center justify-between mb-5">
            <h2
              id="help-title"
              className="text-[#555555] dark:text-[#8A8A8A] text-xs uppercase tracking-widest"
            >
              How to use
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="p-1 -m-1 text-[#555555] dark:text-[#8A8A8A] hover:text-black dark:hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <ul className="flex flex-col gap-4">
            {GUIDE.map((row, i) => (
              <li key={i} className="flex items-start gap-3 text-xs leading-relaxed">
                <span className="w-10 flex-shrink-0 flex justify-center pt-[3px] text-black dark:text-white">
                  {row.icon}
                </span>
                <span className="text-black/80 dark:text-white/80">{row.text}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-[#555555] dark:text-[#8A8A8A] text-xs uppercase tracking-widest mt-7 mb-2">
            About the data
          </h3>
          <p className="text-xs leading-relaxed text-black/60 dark:text-white/60">
            Weather from OpenWeatherMap. All times are the city&apos;s local time. The forecast is in
            3-hour steps, so further-out days are less precise.
          </p>
        </div>
      </dialog>
    </>
  );
}
