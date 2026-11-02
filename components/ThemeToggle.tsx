"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";

// The <html> "dark" class is the single source of truth (set before paint by the
// inline script in layout.tsx), so read it directly rather than mirroring it in state.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const isDarkNow = () => document.documentElement.classList.contains("dark");
const isDarkOnServer = () => true;

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDarkNow, isDarkOnServer);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Storage unavailable (e.g. private browsing) — theme still switches for this visit.
    }
  };

  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className="p-2 rounded-xl glass flex-shrink-0 text-black dark:text-white hover:opacity-70 transition-opacity"
      title={label}
      aria-label={label}
    >
      {dark ? (
        /* Sun — shown in dark mode to switch to light */
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Moon — shown in light mode to switch to dark */
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </motion.button>
  );
}
