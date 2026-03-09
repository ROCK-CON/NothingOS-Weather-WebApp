"use client";

import dynamic from "next/dynamic";
import { type WeatherCondition } from "@/lib/weather";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
  className?: string;
}

// Inline minimal Lottie JSON animations as base64-encoded data URIs
// We use simple SVG-based fallback icons when lottie files aren't available

function SunIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="12" fill="currentColor" opacity="0.9" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="32"
          y1="32"
          x2={32 + 20 * Math.cos((angle * Math.PI) / 180)}
          y2={32 + 20 * Math.sin((angle * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
          transform={`rotate(0, 32, 32)`}
        />
      ))}
    </svg>
  );
}

function CloudIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M44 38H20a10 10 0 010-20 10.03 10.03 0 019.4 6.6A8 8 0 1144 38z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

function PartlyCloudyIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="22" cy="22" r="10" fill="currentColor" opacity="0.8" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <line
          key={i}
          x1={22 + 12 * Math.cos((angle * Math.PI) / 180)}
          y1={22 + 12 * Math.sin((angle * Math.PI) / 180)}
          x2={22 + 16 * Math.cos((angle * Math.PI) / 180)}
          y2={22 + 16 * Math.sin((angle * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}
      <path
        d="M46 46H26a9 9 0 010-18 9.03 9.03 0 018.46 5.94A7.2 7.2 0 1146 46z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function RainIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M46 34H22a10 10 0 010-20 10.03 10.03 0 019.4 6.6A8 8 0 1146 34z"
        fill="currentColor"
        opacity="0.7"
      />
      <line x1="22" y1="42" x2="18" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="32" y1="42" x2="28" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="42" y1="42" x2="38" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function ThunderstormIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M46 30H22a10 10 0 010-20 10.03 10.03 0 019.4 6.6A8 8 0 1146 30z"
        fill="currentColor"
        opacity="0.6"
      />
      <line x1="20" y1="38" x2="16" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="42" y1="38" x2="38" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <polyline
        points="36,34 28,46 34,46 26,58"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SnowIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M44 32H20a10 10 0 010-20 10.03 10.03 0 019.4 6.6A8 8 0 1144 32z"
        fill="currentColor"
        opacity="0.7"
      />
      {[22, 32, 42].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="40" x2={x} y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <line x1={x - 4} y1="44" x2={x + 4} y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1={x - 4} y1="52" x2={x + 4} y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

function MistIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <line x1="12" y1="22" x2="52" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <line x1="16" y1="32" x2="48" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <line x1="10" y1="42" x2="54" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function DrizzleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M44 32H20a10 10 0 010-20 10.03 10.03 0 019.4 6.6A8 8 0 1144 32z"
        fill="currentColor"
        opacity="0.65"
      />
      <line x1="22" y1="42" x2="20" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="30" y1="42" x2="28" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="38" y1="42" x2="36" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="26" y1="50" x2="24" y2="58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="34" y1="50" x2="32" y2="58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

const iconMap: Record<WeatherCondition, React.FC<{ size: number }>> = {
  clear: SunIcon,
  cloudy: CloudIcon,
  "partly-cloudy": PartlyCloudyIcon,
  rain: RainIcon,
  thunderstorm: ThunderstormIcon,
  snow: SnowIcon,
  mist: MistIcon,
  drizzle: DrizzleIcon,
};

export default function WeatherIcon({
  condition,
  size = 48,
  className = "",
}: WeatherIconProps) {
  const Icon = iconMap[condition] ?? PartlyCloudyIcon;
  return (
    <div className={`flex items-center justify-center text-black dark:text-white ${className}`}>
      <Icon size={size} />
    </div>
  );
}
