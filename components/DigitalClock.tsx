"use client";

import { useState, useEffect } from "react";

interface DigitalClockProps {
  timezoneOffset?: number;
}

export default function DigitalClock({ timezoneOffset }: DigitalClockProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [showColon, setShowColon] = useState(true);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let displayDate: Date;

      if (timezoneOffset !== undefined) {
        const utcMs = now.getTime(); // getTime() is already UTC — no local-offset adjustment needed
        displayDate = new Date(utcMs + timezoneOffset * 1000);
      } else {
        displayDate = now;
      }

      if (timezoneOffset !== undefined) {
        setHours(String(displayDate.getUTCHours()).padStart(2, "0"));
        setMinutes(String(displayDate.getUTCMinutes()).padStart(2, "0"));
        setShowColon(displayDate.getUTCSeconds() % 2 === 0);
      } else {
        setHours(String(displayDate.getHours()).padStart(2, "0"));
        setMinutes(String(displayDate.getMinutes()).padStart(2, "0"));
        setShowColon(displayDate.getSeconds() % 2 === 0);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezoneOffset]);

  if (!hours) return <div className="w-[260px] h-[96px]" />;

  return (
    <div
      className="flex items-baseline leading-none"
      style={{ fontFeatureSettings: '"zero" 0' }}
    >
      <span className="text-[96px] font-mono font-bold text-black dark:text-white tracking-tighter leading-none">
        {hours}
      </span>
      <span
        className="text-[96px] font-mono font-bold tracking-tighter leading-none transition-opacity duration-100"
        style={{ color: "#FF3030", opacity: showColon ? 1 : 0.15 }}
      >
        :
      </span>
      <span className="text-[96px] font-mono font-bold text-black dark:text-white tracking-tighter leading-none">
        {minutes}
      </span>
    </div>
  );
}
