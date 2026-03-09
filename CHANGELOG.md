# Changelog

All notable changes to Nothing Weather are documented here.

---

## [Unreleased]

---

## [0.5.0] — 2026-03-10

### Fixed
- **Air Quality / 10-Day Forecast bottom alignment** — both `WeatherDetailsCards` and `WeeklyForecast` are now direct CSS Grid children (wrapper divs removed). The left column's natural height (Wind + Humidity + Pressure + Visibility + Air Quality stacked) exceeds WeeklyForecast's natural height; making `WeeklyForecast` a direct grid child lets `align-self: stretch` expand its glass card to the full row height, aligning both bottoms to exactly the same pixel
- **WeatherDetailsCards internal layout** — replaced `grid-rows-[auto_auto_1fr]` with `flex flex-col`; the two top rows are 2-col grids at natural height; Air Quality uses `flex-1` as a forward-compatible fallback if WeeklyForecast ever becomes the taller column

---

## [0.4.0] — 2026-03-10

### Added
- **Mobile-first card ordering** — on narrow screens cards now stack as:
  Clock → Temperature → Hourly Forecast → 10-Day Forecast → Sunrise & Sunset → Detail cards

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
