"use client";

import { motion } from "framer-motion";
import WeatherIcon from "./WeatherIcon";
import type { DailyForecastItem } from "@/lib/weather";

interface WeeklyForecastProps {
  data: DailyForecastItem[];
  className?: string;
}

// ─── Temperature Trend Graph ──────────────────────────────────────────────────

const SVG_H   = 155; // rendered pixel height of the SVG
const VW      = 100; // viewBox width units
const VH      = 40;  // viewBox height units
const PX      = 4;   // horizontal padding (viewBox units)
const PY      = 10;  // vertical padding — extra room for floating temp labels

function TempTrendGraph({ data }: { data: DailyForecastItem[] }) {
  const n = data.length;
  if (n < 2) return null;

  const highs   = data.map((d) => d.high);
  const lows    = data.map((d) => d.low);
  const tempMin = Math.min(...lows);
  const tempMax = Math.max(...highs);
  const tempRange = tempMax - tempMin || 1;

  // Map a data-index → SVG x  (0–100)
  const toX = (i: number) => PX + (i / (n - 1)) * (VW - 2 * PX);

  // Map a temperature → SVG y  (inverted: higher temp = lower y value)
  const toY = (temp: number) =>
    PY + (1 - (temp - tempMin) / tempRange) * (VH - 2 * PY);

  // Map SVG y → rendered screen pixel y (for absolute-positioned HTML labels)
  const toScreenY = (svgY: number) => (svgY / VH) * SVG_H;

  const highPts = data.map((d, i) => ({ x: toX(i), y: toY(d.high) }));
  const lowPts  = data.map((d, i) => ({ x: toX(i), y: toY(d.low) }));

  // Smooth cubic bezier C-commands (no leading M)
  const smoothCommands = (pts: { x: number; y: number }[]) => {
    let d = "";
    for (let i = 1; i < pts.length; i++) {
      const p  = pts[i - 1];
      const c  = pts[i];
      const mx = ((p.x + c.x) / 2).toFixed(2);
      d += ` C${mx},${p.y.toFixed(2)} ${mx},${c.y.toFixed(2)} ${c.x.toFixed(2)},${c.y.toFixed(2)}`;
    }
    return d;
  };

  // Full smooth path  (M + C commands)
  const smoothPath = (pts: { x: number; y: number }[]) =>
    `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}${smoothCommands(pts)}`;

  // Closed path for the shaded band: forward along highs, back along lows
  const bandPath =
    `M${highPts[0].x.toFixed(2)},${highPts[0].y.toFixed(2)}` +
    smoothCommands(highPts) +
    ` L${lowPts[n - 1].x.toFixed(2)},${lowPts[n - 1].y.toFixed(2)}` +
    smoothCommands([...lowPts].reverse()) +
    " Z";

  const maxHighIdx = highs.indexOf(Math.max(...highs));

  const LINE_DELAY = 1.0;
  const LINE_DUR   = 1.1;
  const DOT_DELAY  = LINE_DELAY + LINE_DUR * 0.75;
  const LBL_DELAY  = DOT_DELAY + 0.3;

  return (
    <>
      {/* Section heading */}
      <h2 className="text-[#555555] dark:text-[#8A8A8A] text-xs font-mono uppercase tracking-widest mt-5 mb-1">
        Temperature Trend
      </h2>

      {/* Wrapper — SVG + absolutely-positioned temperature labels */}
      <div className="relative" style={{ height: SVG_H }}>

        {/* ── Floating temperature labels ── */}
        {data.map((d, i) => {
          const xPct       = toX(i);
          const highLabelY = Math.max(0, toScreenY(highPts[i].y) - 13);
          const lowLabelY  = Math.min(SVG_H - 12, toScreenY(lowPts[i].y) + 4);
          const isPeak     = i === maxHighIdx;

          return (
            <div key={i}>
              {/* High temperature */}
              <motion.span
                className="absolute font-mono text-[8px] -translate-x-1/2 pointer-events-none leading-none"
                style={{
                  left: `${xPct}%`,
                  top: highLabelY,
                  color: isPeak ? "#FF3030" : "rgba(255,255,255,0.65)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: LBL_DELAY + i * 0.05, duration: 0.25 }}
              >
                {d.high}°
              </motion.span>

              {/* Low temperature */}
              <motion.span
                className="absolute font-mono text-[8px] -translate-x-1/2 pointer-events-none leading-none text-white/35"
                style={{ left: `${xPct}%`, top: lowLabelY }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: LBL_DELAY + 0.1 + i * 0.05, duration: 0.25 }}
              >
                {d.low}°
              </motion.span>
            </div>
          );
        })}

        {/* ── SVG graph ── */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: SVG_H, display: "block" }}
          aria-hidden="true"
        >
          {/* Shaded range band between high and low */}
          <motion.path
            d={bandPath}
            fill="currentColor"
            fillOpacity="0.07"
            stroke="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: LINE_DELAY, duration: 0.8 }}
          />

          {/* Low line (dimmer) */}
          <motion.path
            d={smoothPath(lowPts)}
            fill="none"
            stroke="white"
            strokeOpacity="0.25"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: LINE_DUR, delay: LINE_DELAY, ease: "easeInOut" }}
          />

          {/* High line (brighter) */}
          <motion.path
            d={smoothPath(highPts)}
            fill="none"
            stroke="white"
            strokeOpacity="0.7"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: LINE_DUR, delay: LINE_DELAY + 0.1, ease: "easeInOut" }}
          />

          {/* Low dots */}
          {lowPts.map((pt, i) => (
            <motion.circle
              key={`low-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="0.9"
              fill="white"
              fillOpacity="0.3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: DOT_DELAY + i * 0.04, duration: 0.25 }}
            />
          ))}

          {/* High dots — red accent on the peak */}
          {highPts.map((pt, i) => (
            <motion.circle
              key={`high-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={i === maxHighIdx ? 1.35 : 0.9}
              fill={i === maxHighIdx ? "#FF3030" : "white"}
              fillOpacity={i === maxHighIdx ? 1 : 0.7}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: DOT_DELAY + 0.1 + i * 0.04, duration: 0.25 }}
            />
          ))}
        </svg>
      </div>

      {/* ── Day labels along the x-axis ── */}
      <div className="relative mt-1" style={{ height: 16 }}>
        {data.map((d, i) => {
          const xPct = toX(i);
          const label =
            d.dayName === "Today" ? "NOW" : d.dayName.slice(0, 3).toUpperCase();
          return (
            <motion.span
              key={i}
              className="absolute -translate-x-1/2 text-[#555555] dark:text-[#8A8A8A] font-mono text-[9px] tracking-widest leading-none"
              style={{ left: `${xPct}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: LBL_DELAY + 0.2 + i * 0.04, duration: 0.3 }}
            >
              {label}
            </motion.span>
          );
        })}
      </div>
    </>
  );
}

// ─── Day Row ──────────────────────────────────────────────────────────────────

function DayRow({
  item,
  index,
  maxTemp,
  minTemp,
}: {
  item: DailyForecastItem;
  index: number;
  maxTemp: number;
  minTemp: number;
}) {
  const range    = maxTemp - minTemp || 1;
  const barStart = ((item.low  - minTemp) / range) * 100;
  const barWidth = ((item.high - item.low) / range) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.05, duration: 0.4 }}
      className="flex items-center gap-3 py-3 border-b border-black/5 dark:border-white/5 last:border-0"
    >
      {/* Day name */}
      <span className="text-black dark:text-white font-mono text-sm w-12 flex-shrink-0 uppercase tracking-wide">
        {item.dayName}
      </span>

      {/* Icon */}
      <div className="w-8 flex-shrink-0 flex justify-center">
        <WeatherIcon condition={item.condition} size={28} />
      </div>

      {/* Precipitation */}
      <div className="w-10 flex-shrink-0 flex justify-end">
        {Math.round(item.precipitation) > 0 ? (
          <span className="flex items-center gap-1 text-[#FF3030] text-[10px] font-mono">
            <svg width="5" height="7" viewBox="0 0 5 7" fill="currentColor">
              <path d="M2.5 0C2.5 0 0 3.5 0 4.8C0 6.0 1.1 7 2.5 7C3.9 7 5 6.0 5 4.8C5 3.5 2.5 0 2.5 0Z" />
            </svg>
            {Math.round(item.precipitation)}%
          </span>
        ) : null}
      </div>

      {/* Temperature bar */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-[#555555] dark:text-[#8A8A8A] font-mono text-xs w-8 text-right flex-shrink-0">
          {item.low}°
        </span>
        <div className="flex-1 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-black/50 dark:bg-white/70 rounded-full"
            style={{
              marginLeft: `${barStart}%`,
              width: `${Math.max(barWidth, 8)}%`,
            }}
          />
        </div>
        <span className="text-black dark:text-white font-mono text-xs w-8 flex-shrink-0">
          {item.high}°
        </span>
      </div>
    </motion.div>
  );
}

// ─── Weekly Forecast Card ─────────────────────────────────────────────────────

export default function WeeklyForecast({ data, className = "" }: WeeklyForecastProps) {
  const days    = data.slice(0, 6); // Today + 5 days
  const maxTemp = Math.max(...days.map((d) => d.high));
  const minTemp = Math.min(...days.map((d) => d.low));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.5 }}
      className={`w-full glass rounded-2xl p-5 ${className}`}
    >
      <h2 className="text-[#555555] dark:text-[#8A8A8A] text-xs font-mono uppercase tracking-widest mb-4">
        6-Day Forecast
      </h2>

      <div className="flex flex-col">
        {days.map((item, i) => (
          <DayRow
            key={item.date}
            item={item}
            index={i}
            maxTemp={maxTemp}
            minTemp={minTemp}
          />
        ))}
      </div>

      {/* Temperature trend graph fills the remaining space */}
      <TempTrendGraph data={days} />
    </motion.div>
  );
}
