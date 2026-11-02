# Nothing Weather

A Nothing OS–inspired weather web application built with Next.js 16. Minimal monochrome UI, dot matrix aesthetic, live digital clock, and smooth animations — inspired by the weather app on the Nothing Phone.

## Features

- **Live digital clock** — 96px monochrome clock with blinking red colon, updates every second; shows the searched location's local time
- **Current conditions** — Large 96px temperature display with 112px weather icon; "Feels like" and condition description in a clean two-row layout
- **Sunrise & Sunset card** — Arc SVG showing the sun's current position along its daily path, live daylight duration (`Xh Ym`), and Rise / Set times
- **Next 24 hours** — Now plus the next eight 3-hour forecast points in a horizontally scrollable glass card; "Now" highlighted with a red accent bar. All times shown in the searched location's timezone
- **5-day forecast** — Today plus 5 days with temperature range bars scaled to the full period min / max; precipitation indicators
- **Temperature Trend graph** — Smooth bezier curve SVG chart inside the forecast card; shaded band between high and low lines, floating temperature labels, peak day highlighted in red
- **Weather detail cards** — SVG infographic cards: Wind compass, Humidity cylinder, Pressure gauge, Visibility fan lines, and a live Air Quality dot grid (OpenWeatherMap Air Pollution API)
- **City search** — Search any city, with quick-select suggestions; remembers your last city
- **Geolocation** — Auto-loads your local weather on first visit if permission is already granted
- **Light / Dark mode** — Toggle with smooth transition; dark defaults to `#000000`, light to `#f5f5f5`
- **Server-side API** — One Route Handler fetches, validates, caches (10 min) and normalises OpenWeatherMap data; the API key never reaches the browser
- **Honest errors** — If the weather service fails you see an error, never made-up data. Demo data is available only in local development without a key, and is labelled as such
- **PWA ready** — Installable on mobile via `manifest.json`
- **Framer Motion animations** — Entrance animations on all cards and data elements

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Weather API | OpenWeatherMap (Current, 5-day Forecast, Air Pollution — all free tier) |
| Font | Space Mono via `next/font` (self-hosted) |
| Hosting | Vercel |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ROCK-CON/NothingOS-Weather-WebApp.git
cd NothingOS-Weather-WebApp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your API key (optional for local development)

Without a key, `npm run dev` serves labelled demo data. To load real weather:

1. Get a free API key from [openweathermap.org](https://openweathermap.org/api)
2. Copy the example env file and add your key:

```bash
cp .env.local.example .env.local
# then edit .env.local:  WEATHER_API_KEY=your_api_key_here
```

> The key is only read server-side by the `/api/weather` Route Handler. Never commit it — `.env*.local` is git-ignored.

### 4. Run locally

```bash
npm run dev        # http://localhost:3000
npm test           # unit tests (Node 22.18+)
npm run lint
npm run typecheck
```

## Deployment (Vercel)

1. Import the repository at [vercel.com/new](https://vercel.com/new) — Next.js is detected automatically
2. Add `WEATHER_API_KEY` under **Settings → Environment Variables** (Production and Preview)
3. Deploy, then check the readings against a real forecast

Without `WEATHER_API_KEY` a production deployment shows "Weather service is not configured" rather than fake data.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── weather/
│   │       └── route.ts      # Validates input, calls OpenWeatherMap, caches, returns one bundle
│   ├── page.tsx              # Main page — layout, data fetching, CSS Grid structure
│   ├── layout.tsx            # Root layout — Space Mono font, PWA metadata
│   └── globals.css           # Global styles — dot matrix, glass morphism panels
├── components/
│   ├── WeatherCard.tsx       # Temperature (96px) + weather icon (112px) + description
│   ├── DigitalClock.tsx      # Live 96px clock with blinking red colon; timezone-aware
│   ├── HourlyForecast.tsx    # Next-24-hours scrollable forecast inside glass card
│   ├── WeeklyForecast.tsx    # 6-day forecast with range bars + temperature trend graph
│   ├── WeatherInfoCards.tsx  # SunriseSunsetCard, WeatherDetailsCards, and six
│   │                         # SVG infographic cards (Wind, Humidity, Pressure,
│   │                         # Visibility, AirQuality)
│   ├── WeatherIcon.tsx       # Condition-mapped SVG weather icons
│   ├── LocationSearch.tsx    # City search with suggestions and geolocation button
│   ├── ThemeToggle.tsx       # Light / dark mode toggle
│   └── LoadingSkeleton.tsx   # Shimmer loading states
├── lib/
│   ├── weather.ts            # Types, input validation, timezone helpers, OWM parsing (pure, tested)
│   ├── weather-client.ts     # Browser fetch of /api/weather
│   └── mock-weather.ts       # Demo data for local development only
├── test/
│   └── weather.test.ts       # node:test unit tests
└── public/
    ├── manifest.json         # PWA manifest
    └── icons/                # App icons (SVG + PNG)
```

## Layout

The desktop layout uses a unified two-column CSS Grid. Mobile stacks all cards in a single column with explicit ordering:

```
┌─────────────────────────┬─────────────────────────┐
│  Temperature + Icon     │  Digital Clock          │  ← Row 1
│  Feels like / Desc      │  (location local time)  │
├─────────────────────────┼─────────────────────────┤
│  Sunrise & Sunset       │  Next 24 Hours          │  ← Row 2
│  [daylight + arc]       │  [3-hourly scroll]      │
├─────────────────────────┼─────────────────────────┤
│  Wind  │  Humidity      │  5-Day Forecast         │  ← Row 3
│  Press │  Visibility    │  [range bars]           │
│     Air Quality         │  ─────────────────────  │
│                         │  Temperature Trend      │
│                         │  [bezier curve graph]   │
└─────────────────────────┴─────────────────────────┘
```

**Mobile order:** Clock → Temperature → Hourly Forecast → 5-Day Forecast → Sunrise & Sunset → Detail cards

## Design Tokens

| Token | Dark | Light |
|---|---|---|
| Background | `#000000` | `#f5f5f5` |
| Primary text | `#FFFFFF` | `#000000` |
| Secondary text | `#8A8A8A` | `#555555` |
| Accent | `#FF3030` | `#FF3030` |
| Font | Space Mono | Space Mono |
| Card style | Glass morphism | Glass morphism |
| Background pattern | Dot matrix | Dot matrix |

## License

MIT — see [LICENSE](./LICENSE)
