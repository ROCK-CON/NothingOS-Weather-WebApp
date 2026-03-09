"use client";

import { motion } from "framer-motion";

function Shimmer({ className }: { className: string }) {
  return (
    <motion.div
      className={`bg-black/5 dark:bg-white/5 rounded-xl ${className}`}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="w-full space-y-8">
      {/* Temperature skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Shimmer className="h-24 w-40" />
          <Shimmer className="h-4 w-28" />
        </div>
        <Shimmer className="h-16 w-16 rounded-2xl" />
      </div>

      {/* Description skeleton */}
      <Shimmer className="h-6 w-36" />

      {/* Stats grid skeleton */}
      <div className="glass rounded-2xl p-5 grid grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Hourly skeleton */}
      <div className="space-y-3">
        <Shimmer className="h-3 w-24" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-24 w-16 flex-shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Weekly skeleton */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <Shimmer className="h-3 w-24" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Shimmer className="h-4 w-10" />
            <Shimmer className="h-6 w-6 rounded-lg" />
            <Shimmer className="h-1 flex-1 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
