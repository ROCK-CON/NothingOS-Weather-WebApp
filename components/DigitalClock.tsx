"use client";

import { useState, useEffect } from "react";

export default function DigitalClock() {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [showColon, setShowColon] = useState(true);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHours(String(now.getHours()).padStart(2, "0"));
      setMinutes(String(now.getMinutes()).padStart(2, "0"));
      setShowColon(now.getSeconds() % 2 === 0);
    };
    tick(); // run immediately on mount
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Prevent hydration mismatch — render placeholder until client time is known
  if (!hours) return <div className="w-[196px] h-[72px]" />;

  return (
    <div className="flex items-baseline leading-none">
      <span className="text-[72px] font-mono font-bold text-black dark:text-white tracking-tighter leading-none">
        {hours}
      </span>
      <span
        className="text-[72px] font-mono font-bold tracking-tighter leading-none transition-opacity duration-100"
        style={{ color: "#FF3030", opacity: showColon ? 1 : 0.15 }}
      >
        :
      </span>
      <span className="text-[72px] font-mono font-bold text-black dark:text-white tracking-tighter leading-none">
        {minutes}
      </span>
    </div>
  );
}
