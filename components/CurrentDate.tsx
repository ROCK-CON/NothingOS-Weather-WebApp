"use client";

import { formatLocalDate } from "@/lib/weather";
import { useNowSeconds } from "@/lib/use-now";

/** Today's date at the location, from the real clock rather than the reading's own date. */
export default function CurrentDate({ timezoneOffset }: { timezoneOffset: number }) {
  return <>{formatLocalDate(useNowSeconds(), timezoneOffset)}</>;
}
