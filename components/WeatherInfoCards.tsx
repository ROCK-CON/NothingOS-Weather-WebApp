"use client";

import { motion } from "framer-motion";
import type { WeatherData } from "@/lib/weather";

const RED = "#FF3030";

function InfoCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`glass rounded-2xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#555555] dark:text-[#8A8A8A] text-xs font-mono uppercase tracking-widest mb-4">
      {children}
    </p>
  );
}

// ─── 1. Sunrise & Sunset ──────────────────────────────────────────────────────

export function SunriseSunsetCard({
  sunrise,
  sunset,
  now,
  className = "",
}: {
  sunrise: number;
  sunset: number;
  now: number;
  className?: string;
}) {
  const fmt = (unix: number) =>
    new Date(unix * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  // t clamped 0–1 along the arc
  const t = Math.min(1, Math.max(0, (now - sunrise) / (sunset - sunrise)));

  // Quadratic Bézier: P0=(20,72), P1=(130,8), P2=(240,72)
  const p0 = { x: 20, y: 72 };
  const p1 = { x: 130, y: 8 };
  const p2 = { x: 240, y: 72 };

  // Point on curve at t
  const bx = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const by = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

  const isDaytime = now >= sunrise && now <= sunset;
  const dotVisible = isDaytime;

  return (
    <InfoCard delay={0.65} className={`h-full flex flex-col ${className}`}>
      <CardLabel>Sunrise &amp; Sunset</CardLabel>

      {/* Arc fills all available height, anchored to bottom — scales with card */}
      <div className="flex-1 flex items-end">
        <svg viewBox="0 0 260 84" className="w-full block">
          {/* Horizon line */}
          <line
            x1="10"
            y1="74"
            x2="250"
            y2="74"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="1"
          />

          {/* Arc path — dashed */}
          <path
            d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Elapsed arc overlay */}
          {isDaytime && (
            <path
              d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
              fill="none"
              stroke={RED}
              strokeOpacity="0.5"
              strokeWidth="1.5"
              strokeDasharray={`${t * 340} 340`}
            />
          )}

          {/* Sun dot */}
          {dotVisible && (
            <>
              <circle cx={bx} cy={by} r="7" fill={RED} fillOpacity="0.15" />
              <circle cx={bx} cy={by} r="4" fill={RED} />
            </>
          )}

          {/* Sunrise dot */}
          <circle cx={p0.x} cy={p0.y} r="3" fill="currentColor" fillOpacity="0.3" />
          {/* Sunset dot */}
          <circle cx={p2.x} cy={p2.y} r="3" fill="currentColor" fillOpacity="0.3" />
        </svg>
      </div>

      {/* Rise and Set times — below the arc */}
      <div className="flex items-end justify-between mt-3 pt-3 border-t border-black/5 dark:border-white/5">
        <div className="flex flex-col gap-1">
          <span className="text-[#555555] dark:text-[#8A8A8A] text-[10px] font-mono uppercase tracking-widest">
            Rise
          </span>
          <span className="text-black dark:text-white font-mono text-sm">
            {fmt(sunrise)}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-[#555555] dark:text-[#8A8A8A] text-[10px] font-mono uppercase tracking-widest">
            Set
          </span>
          <span className="text-black dark:text-white font-mono text-sm">
            {fmt(sunset)}
          </span>
        </div>
      </div>
    </InfoCard>
  );
}

// ─── 2. Wind ──────────────────────────────────────────────────────────────────

const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export function WindCard({
  windSpeed,
  windDeg,
}: {
  windSpeed: number;
  windDeg: number;
}) {
  // Convert meteorological wind direction (where wind comes FROM) to needle pointing TO
  const needleRad = ((windDeg + 180) % 360) * (Math.PI / 180);
  const cx = 50;
  const cy = 50;
  const r = 36;
  const nx = cx + r * 0.65 * Math.sin(needleRad);
  const ny = cy - r * 0.65 * Math.cos(needleRad);

  const dirLabel = DIRS[Math.round(windDeg / 45) % 8];

  return (
    <InfoCard delay={0.7}>
      <CardLabel>Wind</CardLabel>
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 100 100" className="w-24 h-24">
          {/* Outer ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
          {/* Cardinal tick marks */}
          {[0, 90, 180, 270].map((deg) => {
            const rad = deg * (Math.PI / 180);
            const x1 = cx + (r - 4) * Math.sin(rad);
            const y1 = cy - (r - 4) * Math.cos(rad);
            const x2 = cx + (r + 1) * Math.sin(rad);
            const y2 = cy - (r + 1) * Math.cos(rad);
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
            );
          })}
          {/* N label — always red */}
          <text
            x={cx}
            y={cy - r + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fontFamily="monospace"
            fill={RED}
            fontWeight="bold"
          >
            N
          </text>
          {/* S, E, W labels */}
          {[
            { label: "S", x: cx, y: cy + r - 10 },
            { label: "E", x: cx + r - 10, y: cy },
            { label: "W", x: cx - r + 10, y: cy },
          ].map(({ label, x, y }) => (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fontFamily="monospace"
              fill="currentColor"
              fillOpacity="0.35"
            >
              {label}
            </text>
          ))}
          {/* Needle line */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke={RED}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Center dot */}
          <circle cx={cx} cy={cy} r="3" fill="currentColor" fillOpacity="0.4" />
          {/* Needle tip */}
          <circle cx={nx} cy={ny} r="3" fill={RED} />
        </svg>
        <div className="text-center">
          <span className="text-black dark:text-white font-mono text-lg font-bold">
            {windSpeed}
          </span>
          <span className="text-[#555555] dark:text-[#8A8A8A] font-mono text-xs ml-1">
            km/h
          </span>
          <p className="text-[#555555] dark:text-[#8A8A8A] font-mono text-xs mt-1">
            {dirLabel}
          </p>
        </div>
      </div>
    </InfoCard>
  );
}

// ─── 3. Humidity ──────────────────────────────────────────────────────────────

export function HumidityCard({ humidity }: { humidity: number }) {
  const fillRatio = humidity / 100;
  // Cylinder dimensions in SVG units
  const cw = 44;
  const ch = 70;
  const rx = cw / 2;
  const ry = 6;
  const cx = 50;
  const topY = 14;
  const bottomY = topY + ch;
  const fillHeight = ch * fillRatio;
  const fillY = bottomY - fillHeight;

  return (
    <InfoCard delay={0.75}>
      <CardLabel>Humidity</CardLabel>
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 100 106" className="w-24 h-24">
          {/* Cylinder body outline */}
          <path
            d={`M ${cx - rx} ${topY} L ${cx - rx} ${bottomY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottomY} L ${cx + rx} ${topY}`}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="1.5"
          />
          {/* Fill clip */}
          <clipPath id="cyl-clip">
            <rect x={cx - rx} y={topY} width={cw} height={ch} />
          </clipPath>
          {/* Fill body */}
          <rect
            x={cx - rx}
            y={fillY}
            width={cw}
            height={fillHeight}
            fill={RED}
            fillOpacity="0.25"
            clipPath="url(#cyl-clip)"
          />
          {/* Fill top ellipse */}
          {fillRatio > 0.02 && (
            <ellipse
              cx={cx}
              cy={fillY}
              rx={rx}
              ry={ry}
              fill={RED}
              fillOpacity="0.4"
            />
          )}
          {/* Bottom ellipse */}
          <ellipse
            cx={cx}
            cy={bottomY}
            rx={rx}
            ry={ry}
            fill="currentColor"
            fillOpacity="0.08"
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
          {/* Top ellipse outline */}
          <ellipse
            cx={cx}
            cy={topY}
            rx={rx}
            ry={ry}
            fill="currentColor"
            fillOpacity="0.05"
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
        </svg>
        <div className="text-center">
          <span className="text-black dark:text-white font-mono text-lg font-bold">
            {humidity}
          </span>
          <span className="text-[#555555] dark:text-[#8A8A8A] font-mono text-xs ml-1">
            %
          </span>
        </div>
      </div>
    </InfoCard>
  );
}

// ─── 4. Pressure ──────────────────────────────────────────────────────────────

export function PressureCard({ pressure }: { pressure: number }) {
  // Range: 960–1040 hPa → 0–1
  const min = 960;
  const max = 1040;
  const ratio = Math.min(1, Math.max(0, (pressure - min) / (max - min)));

  // Semi-circle gauge: from 135° to 45° clockwise (270° sweep)
  // In SVG angles: 135° = start, goes to 135 + 270 = 405° = 45°
  const cx = 50;
  const cy = 58;
  const r = 34;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcStart = 135; // degrees
  const arcSweep = 270;

  const startRad = toRad(arcStart);
  const endRad = toRad(arcStart + arcSweep);
  const needleRad = toRad(arcStart + ratio * arcSweep);

  const sx = cx + r * Math.cos(startRad);
  const sy = cy + r * Math.sin(startRad);
  const ex = cx + r * Math.cos(endRad);
  const ey = cy + r * Math.sin(endRad);

  // Needle tip on arc
  const nx = cx + r * Math.cos(needleRad);
  const ny = cy + r * Math.sin(needleRad);

  // Active arc endpoint
  const ax = cx + r * Math.cos(needleRad);
  const ay = cy + r * Math.sin(needleRad);
  const activeSwep = ratio * arcSweep;
  const largeArc1 = activeSwep > 180 ? 1 : 0;

  const label =
    pressure < 1000 ? "Low" : pressure > 1020 ? "High" : "Normal";

  return (
    <InfoCard delay={0.8}>
      <CardLabel>Pressure</CardLabel>
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 100 78" className="w-28 h-20">
          {/* Background arc */}
          <path
            d={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Active arc */}
          {ratio > 0.01 && (
            <path
              d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc1} 1 ${ax} ${ay}`}
              fill="none"
              stroke={RED}
              strokeOpacity="0.6"
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}
          {/* Needle tip dot */}
          <circle cx={nx} cy={ny} r="4" fill={RED} />
          {/* Center dot */}
          <circle cx={cx} cy={cy} r="3" fill="currentColor" fillOpacity="0.2" />
        </svg>
        <div className="text-center -mt-1">
          <span className="text-black dark:text-white font-mono text-base font-bold">
            {pressure}
          </span>
          <span className="text-[#555555] dark:text-[#8A8A8A] font-mono text-xs ml-1">
            hPa
          </span>
          <p className="text-[#555555] dark:text-[#8A8A8A] font-mono text-xs mt-1">
            {label}
          </p>
        </div>
      </div>
    </InfoCard>
  );
}

// ─── 5. Visibility ────────────────────────────────────────────────────────────

export function VisibilityCard({ visibility }: { visibility: number }) {
  // visibility in metres, max 10000
  const ratio = Math.min(1, visibility / 10000);
  const visKm = (visibility / 1000).toFixed(1);

  // 6 fan lines emanating from bottom-center
  const cx = 50;
  const cy = 80;
  const lineCount = 6;
  const maxLen = 58;
  const angleSpread = 140; // total spread in degrees
  const startAngle = 180 + (180 - angleSpread) / 2; // centred upward

  return (
    <InfoCard delay={0.85}>
      <CardLabel>Visibility</CardLabel>
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 100 90" className="w-24 h-20">
          {Array.from({ length: lineCount }, (_, i) => {
            const angleDeg =
              startAngle + (i / (lineCount - 1)) * angleSpread;
            const rad = (angleDeg * Math.PI) / 180;
            // Length grows for lines near center
            const centerFactor =
              1 - Math.abs(i / (lineCount - 1) - 0.5) * 0.4;
            const len = maxLen * centerFactor;
            const ex = cx + len * Math.cos(rad);
            const ey = cy + len * Math.sin(rad);

            // Active if within visible ratio
            const lineRatio = i / (lineCount - 1);
            // Light lines span from edges inward; active lines from center outward
            // Show ratio of lines based on visibility
            const active = lineRatio <= ratio || (1 - lineRatio) <= ratio;

            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={ex}
                y2={ey}
                stroke={active ? RED : "currentColor"}
                strokeOpacity={active ? 0.7 : 0.12}
                strokeWidth={active ? "2" : "1.5"}
                strokeLinecap="round"
              />
            );
          })}
          {/* Eye / origin dot */}
          <circle cx={cx} cy={cy} r="3" fill={RED} fillOpacity="0.8" />
        </svg>
        <div className="text-center">
          <span className="text-black dark:text-white font-mono text-lg font-bold">
            {visKm}
          </span>
          <span className="text-[#555555] dark:text-[#8A8A8A] font-mono text-xs ml-1">
            km
          </span>
        </div>
      </div>
    </InfoCard>
  );
}

// ─── 6. Air Quality ───────────────────────────────────────────────────────────

const AQI_LABELS: Record<number, string> = {
  1: "Good",
  2: "Fair",
  3: "Moderate",
  4: "Poor",
  5: "Very Poor",
};

export function AirQualityCard({ aqi }: { aqi: number }) {
  const cols = 10;
  const rows = 4;
  const dotR = 3;
  const gapX = 10;
  const gapY = 10;
  const startX = 10;
  const startY = 8;

  // Columns lit = ceil(aqi / 5 * cols)
  const litCols = Math.round((aqi / 5) * cols);

  return (
    <InfoCard delay={0.9} className="col-span-2">
      <div className="flex items-center justify-between mb-4">
        <CardLabel>Air Quality</CardLabel>
        <span
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: aqi <= 2 ? RED : aqi <= 3 ? "#FFA500" : "#FF3030" }}
        >
          {AQI_LABELS[aqi] ?? "—"}
        </span>
      </div>
      <svg viewBox={`0 0 ${startX * 2 + (cols - 1) * gapX + dotR * 2} ${startY * 2 + (rows - 1) * gapY + dotR * 2}`} className="w-full" style={{ maxHeight: 60 }}>
        {Array.from({ length: cols }, (_, col) =>
          Array.from({ length: rows }, (_, row) => {
            const lit = col < litCols;
            return (
              <circle
                key={`${col}-${row}`}
                cx={startX + col * gapX}
                cy={startY + row * gapY}
                r={dotR}
                fill={lit ? RED : "currentColor"}
                fillOpacity={lit ? 0.8 : 0.1}
              />
            );
          })
        )}
      </svg>
      <div className="flex justify-between mt-3">
        <span className="text-[#555555] dark:text-[#8A8A8A] font-mono text-[10px]">
          AQI {aqi}
        </span>
        <span className="text-[#555555] dark:text-[#8A8A8A] font-mono text-[10px]">
          1 – 5
        </span>
      </div>
    </InfoCard>
  );
}

// ─── Details cards (Wind, Humidity, Pressure, Visibility, AQ) ─────────────────

export function WeatherDetailsCards({ data }: { data: WeatherData }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <WindCard windSpeed={data.windSpeed} windDeg={data.windDeg} />
      <HumidityCard humidity={data.humidity} />
      <PressureCard pressure={data.pressure} />
      <VisibilityCard visibility={data.visibility} />
      <AirQualityCard aqi={data.aqi} />
    </div>
  );
}

// ─── Combined export ──────────────────────────────────────────────────────────

export default function WeatherInfoCards({ data }: { data: WeatherData }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SunriseSunsetCard
        sunrise={data.sunrise}
        sunset={data.sunset}
        now={data.dt}
      />
      <WindCard windSpeed={data.windSpeed} windDeg={data.windDeg} />
      <HumidityCard humidity={data.humidity} />
      <PressureCard pressure={data.pressure} />
      <VisibilityCard visibility={data.visibility} />
      <AirQualityCard aqi={data.aqi} />
    </div>
  );
}
