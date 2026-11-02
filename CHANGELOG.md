# Changelog

All notable changes to Nothing Weather are documented here.

---

## [Unreleased]

---

## [0.11.1] — 2026-11-02

### Added
- **New app icon** — white cloud with a red dot-matrix sun, used for the browser tab (`app/icon.svg` + `app/favicon.ico`), iPhone home screen (`app/apple-icon.png`) and Android/installed app (192, 512 and a maskable 512 in `public/icons/`)
- **Link preview** — `app/opengraph-image.png` (1200×630): the icon alone on the site's dot-grid background, no text. Open Graph and Twitter card tags now set, with `metadataBase` = https://weather.rockley.au

### Removed
- Placeholder 70-byte icons and the unused `public/icons/icon.svg`

## [0.11.0] — 2026-11-02

### Added
- **How to use guide** — a "?" button in the header opens a short guide: a bottom sheet on phones, a centred panel on larger screens. Each line starts with the same icon used on the page, so it doubles as a key. Closes with ×, Esc, or a tap outside. Content lives in `components/HelpGuide.tsx`

### Changed
- Long city names now truncate with "…" so the header buttons always fit on narrow phones

## [0.10.1] — 2026-11-02

### Fixed
- **Tap to refresh looked broken** — the line showed the age of the weather reading, which can't change until a new reading exists (the server caches each city for 10 minutes, and observations are often several minutes old when cached). Tapping fetched successfully but nothing visibly changed. The line now reads **"Checked just now · reading 13:05"**: *Checked* resets on every refresh, *reading* is when the observation was taken (location's local time). "Checking…" now shows for a moment while refreshing

## [0.10.0] — 2026-11-02

### Added
- **Auto-refresh** — data refreshes every 10 minutes while the page is open, and straight away when you return to the tab or reconnect if it's older than that. Background refreshes keep the current data on failure and say so, rather than replacing the page with an error
- **"Updated X min ago"** line under the date, showing the age of the reading; tap it to refresh now
- **Saved cities** — star the current city to save it (up to 8); saved cities appear as one-tap chips under the date. Stored in this browser only
- **Rain and snow amounts** — Next 24 Hours shows each block's expected mm under the chance; the 5-day rows show the day's total. Snow is marked with a snowflake. Amounts under 1 mm show as "<1 mm"; nothing is shown when none is expected
- **Wind gusts** — the Wind card shows gusts (hidden when OpenWeatherMap doesn't report them); the hourly view shows gusts ("G 45") only when they're strong and well above the average wind
- **Night icons** — moon icons for clear and partly cloudy skies after dark
- **Tap a day for detail** — each 5-day row expands to show that day's 3-hourly forecast

---

## [0.9.1] — 2026-11-02

### Changed
- **Default city is now Hobart, AU** (shown on a first visit; after that the last searched city is remembered)
- **Server runs in Sydney** (`syd1`, via `vercel.json`) instead of US East, so weather lookups from Australia make a much shorter round trip

---

## [0.9.0] — 2026-11-02

Security review and migration from Replit to Vercel.

### Security
- **Removed a committed API key** — `.replit` contained the OpenWeatherMap key in plain text. The key has been revoked; `.replit` and `replit.md` are removed and `.replit` is now git-ignored
- **Renamed env var** `NEXT_PUBLIC_WEATHER_API_KEY` → `WEATHER_API_KEY` so it can never be bundled into browser code
- **API route hardened** — validates city (≤100 chars, letters and place-name punctuation only) and coordinates (numeric, in range, rounded to ~1 km); 8 s upstream timeout; upstream errors are logged server-side and never echoed to the client
- **Response caching** — successful responses are cached for 10 minutes at the CDN and in Next's data cache, cutting OpenWeatherMap usage and limiting quota-abuse
- **Security headers** — Content-Security-Policy (production), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`; `X-Powered-By` removed
- **Dependencies** — Next.js 14 → 16, React 18 → 19; removed `axios` (≈26 advisories) and unused `lottie-react`. Production `npm audit`: 0 vulnerabilities (was 7, including 1 critical)

### Fixed
- **No more silent fake data** — any API failure previously returned random mock weather that looked real (and labelled it with whatever was searched, e.g. a misspelt city). Errors now show in the error banner; demo data is only used in local development without a key, and is clearly labelled
- **Air Quality was hard-coded to "Good"** — now uses OpenWeatherMap's Air Pollution API; shows "Unavailable" if that call fails
- **Times and dates used the device's timezone** — hourly times, sunrise/sunset, the date line and daily grouping now all use the searched location's timezone
- **"Today" mislabelled late in the evening** when every forecast point fell on the next day
- **"Hourly" forecast spanned 72 hours** in 3-hour steps — now shows Now + the next 24 hours ("Next 24 Hours")
- **Precipitation units mixed** fractions and percentages; now consistently 0–100 %, with the daily value being the day's highest chance
- **Stale results** — a slow earlier lookup could overwrite a newer search; in-flight requests are now cancelled
- **Stuck loading skeleton** if location permission was granted but the position lookup failed
- Midnight could render as "24" in some browsers

### Changed
- One API call per lookup (`/api/weather` returns current + hourly + daily together) instead of two from the browser
- Remembers the last searched city
- Space Mono is self-hosted via `next/font` (no request to Google Fonts, no font flash)
- Pinch-zoom re-enabled; `aria-label`s on icon-only buttons
- Theme preference reads/writes are safe in private browsing
- Added unit tests (`npm test`) for parsing, timezone handling and input validation
- ESLint 9 flat config; Replit port-5000 scripts removed

---

## [0.8.0] — 2026-03-10

### Fixed
- **Default city resolves to Melbourne, Australia** — appended country code to `DEFAULT_CITY` (`"Melbourne,AU"`). Previously the bare name `"Melbourne"` was resolved by OpenWeatherMap to Melbourne, Florida, USA
- **DigitalClock timezone calculation** — `Date.getTime()` already returns UTC milliseconds; the previous code additionally added `getTimezoneOffset() * 60000`, which double-counted the device's local offset and caused the displayed time to shift by the browser's timezone rather than always showing the searched city's local time. Removed the erroneous `getTimezoneOffset()` term
- **Hourly Forecast gap between "Now" and the next slot** — OWM free tier returns 3-hour interval forecasts starting from the next upcoming UTC slot, so the first item could be up to 3 hours ahead of the actual current time. Marking that item as "Now" and then showing the subsequent slot with its real label created a visible gap of up to ~6 hours. Fixed by injecting current weather data as a genuine "Now" entry at index 0 and filtering out any forecast slots with timestamps in the past (`item.time > weather.dt`). Applied to both city-name and coordinate fetch paths

---

## [0.7.0] — 2026-03-10

### Added
- **Temperature Trend graph** — SVG line chart embedded in the 6-Day Forecast card below the forecast rows. Plots smooth cubic bezier curves for daily high and low temperatures, with a shaded band filling the range between them. Floating HTML temperature labels sit above/below each data point (avoiding SVG text distortion from `preserveAspectRatio="none"`). The hottest day's dot is highlighted in `#FF3030` red. Day abbreviations appear on the x-axis; "Today" displays as "NOW".
- **"TEMPERATURE TREND" section heading** — labelled section break inside the forecast card, styled to match all other card headings (`font-mono uppercase tracking-widest` in muted grey)

### Changed
- **5-Day Forecast** — forecast rows and temperature trend graph now show Today + 5 days (6 entries total). Previously capped at 5 entries (Today + 4 days). Card heading reads "5-Day Forecast"

---

## [0.6.0] — 2026-03-10

### Added
- **Server-side API proxy** — new Next.js Route Handler at `app/api/weather/route.ts`. All OpenWeatherMap requests are proxied server-side so the API key (`NEXT_PUBLIC_WEATHER_API_KEY`) is never sent to the browser. Accepts `endpoint`, `city`, `lat`, and `lon` query parameters; returns proxied JSON or a structured error response

### Changed
- **DigitalClock** — now accepts a `timezoneOffset` prop (UTC offset in seconds). When a city is searched, the clock displays that location's local time rather than the user's device time. UTC offset arithmetic: `utcMs + timezoneOffset * 1000`
- **Weather data layer** (`lib/weather.ts`) — all API calls now route through `/api/weather` instead of calling OpenWeatherMap directly from the browser. Added `timezoneOffset` field to `WeatherData` interface. Added `parseWeatherResponse()` and `parseForecastResponse()` helpers for clean data mapping
- **Port** changed from 3000 → 5000 (`-p 5000 -H 0.0.0.0`) for Replit compatibility. Dev and start scripts updated in `package.json`

---

## [0.5.0] — 2026-03-10

### Fixed
- **Air Quality / 10-Day Forecast bottom alignment** — both `WeatherDetailsCards` and `WeeklyForecast` are now direct CSS Grid children (wrapper divs removed). The left column's natural height (Wind + Humidity + Pressure + Visibility + Air Quality stacked) exceeds WeeklyForecast's natural height; making `WeeklyForecast` a direct grid child lets `align-self: stretch` expand its glass card to the full row height, aligning both bottoms to exactly the same pixel
- **WeatherDetailsCards internal layout** — replaced `grid-rows-[auto_auto_1fr]` with `flex flex-col`; the two top rows are 2-col grids at natural height; Air Quality uses `flex-1` as a forward-compatible fallback if WeeklyForecast ever becomes the taller column

---

## [0.4.0] — 2026-03-10

### Added
- **Mobile-first card ordering** — on narrow screens cards now stack as:
  Clock → Temperature → Hourly Forecast → 6-Day Forecast → Sunrise & Sunset → Detail cards

### Changed
- **Unified CSS Grid** — three separate sub-row grids merged into one `grid-cols-1 lg:grid-cols-2` container. Mobile ordering is controlled with CSS `order-*` utilities; desktop layout uses explicit `lg:col-start` / `lg:row-start` placement to reproduce the same 3-row × 2-col alignment as before
- Row 1 items (WeatherCard, DigitalClock) use `lg:self-start` to preserve top-alignment at desktop width
- Row 2 (SunriseSunset / HourlyForecast) and Row 3 (DetailCards / WeeklyForecast) use default stretch so CSS Grid continues to bottom-align each pair

---

## [0.3.0] — 2026-03-10

### Added
- **Daylight duration** in Sunrise & Sunset card — calculates `Xh Ym` live from sunrise/sunset timestamps and displays above the arc, filling previously empty vertical space
- **Hourly Forecast glass card** — wrapped in the same `glass rounded-2xl p-5` container as all other cards for visual consistency

### Changed
- **Weather icon** enlarged from 80px → 112px to better match the visual weight of the 96px temperature digits
- **WeatherCard layout** restructured into two explicit rows: Row 1 = temperature | icon (both `items-center`), Row 2 = "Feels like" | description (`justify-between`) — guarantees horizontal alignment regardless of sizes
- **DigitalClock** font size increased from 72px → 96px to fill the right header column; added `fontFeatureSettings: '"zero" 0'` to suppress the dotted/slashed zero rendered by some monospace fonts
- **HourlyForecast items** simplified — removed individual card borders/backgrounds; items are clean columns inside the shared glass card; "Now" column keeps red accent bar and tinted background

### Fixed
- **Excess space in Air Quality and 10-Day Forecast cards** — removed `grid-rows-3 h-full [&>*]:h-full` from `WeatherDetailsCards` which was creating a circular CSS Grid sizing dependency that inflated both columns beyond their natural heights
- **SunriseSunsetCard height** — times (Rise / Set) moved back to flank the arc horizontally so the card's natural height (~166px) stays below HourlyForecast's natural height (~196px), allowing CSS Grid stretch to size the row correctly

---

## [0.2.0] — 2026-03-09

### Added
- **Live digital clock** — 96px `Space Mono` clock with blinking red colon (even seconds = full opacity, odd = 15% opacity), placed in the right header column
- **Light / Dark mode toggle** — `ThemeToggle` component using `next-themes`; smooth transition between dark (`#000000`) and light (`#f5f5f5`) themes
- **Six SVG infographic cards** in `WeatherInfoCards.tsx`:
  - Wind — compass rose with directional needle
  - Humidity — cylinder fill graphic
  - Pressure — 270° gauge arc
  - Visibility — fan lines radiating from origin
  - Air Quality — dot grid (AQI 1–5)
  - Sunrise & Sunset — quadratic Bézier arc with animated sun position dot
- **10-day forecast** extended from 7 days
- **Red accent indicators** — precipitation droplet icon in hourly and weekly forecasts

### Changed
- **Layout** refactored into a two-column CSS Grid with three independent sub-rows for guaranteed horizontal alignment:
  - Header row: WeatherCard | DigitalClock
  - Sub-row 1: SunriseSunsetCard (stretch) | HourlyForecast (height-setter)
  - Sub-row 2: WeatherDetailsCards | WeeklyForecast
- **WeatherCard** — stats grid removed; temperature (96px) + weather icon side by side; description moved under icon
- **HourlyForecast** — current-hour "Now" pill with red accent bar at top

### Removed
- Stats grid (humidity, wind, UV) from WeatherCard — replaced by dedicated infographic cards

---

## [0.1.0] — Initial release

### Added
- Next.js 14 App Router project with TypeScript and Tailwind CSS
- Current weather display — temperature, condition, feels like
- 24-hour horizontally scrollable hourly forecast
- 7-day weekly forecast with temperature range bars
- City search with quick-select suggestions
- Geolocation support — auto-loads local weather if permission granted
- Mock Melbourne weather data fallback (no API key required)
- OpenWeatherMap API integration
- Loading skeleton UI with shimmer animation
- Framer Motion entrance animations
- PWA manifest for mobile installation
- Nothing OS–inspired monochrome aesthetic — dot matrix background, glass morphism panels, Space Mono font
- MIT licence
