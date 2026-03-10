# Nothing Weather

A Nothing OS–inspired weather web application built with Next.js 14. Minimal monochrome UI, dot matrix aesthetic, live digital clock, and smooth animations — inspired by the weather app on the Nothing Phone.

## Features

- **Live digital clock** — 96px monochrome clock with blinking red colon, updates every second; shows the searched location's local time
- **Current conditions** — Large 96px temperature display with 112px weather icon; "Feels like" and condition description in a clean two-row layout
- **Sunrise & Sunset card** — Arc SVG showing the sun's current position along its daily path, live daylight duration (`Xh Ym`), and Rise / Set times
- **24-hour hourly forecast** — Horizontally scrollable glass card; current hour highlighted with a red accent bar
- **5-day forecast** — Today plus 5 days with temperature range bars scaled to the full period min / max; precipitation indicators
- **Temperature Trend graph** — Smooth bezier curve SVG chart inside the forecast card; shaded band between high and low lines, floating temperature labels, peak day highlighted in red
- **Weather detail cards** — Six SVG infographic cards: Wind compass, Humidity cylinder, Pressure gauge, Visibility fan lines, Air Quality dot grid
- **City search** — Type-ahead suggestions with quick-select
- **Geolocation** — Auto-loads your local weather on first visit if permission is already granted
- **Light / Dark mode** — Toggle with smooth transition; dark defaults to `#000000`, light to `#f5f5f5`
- **Server-side API proxy** — API key is kept server-side via a Next.js Route Handler; never exposed to the browser
- **Mock data fallback** — Fully functional without an API key (defaults to Melbourne, AU mock data)
- **PWA ready** — Installable on mobile via `manifest.json`
- **Framer Motion animations** — Entrance animations on all cards and data elements

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion v11 |
| Weather API | OpenWeatherMap |
| HTTP | Axios |
| Font | Space Mono |

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

### 3. Configure your API key (optional)

The app works out of the box with mock Melbourne weather data. To load real weather:

1. Get a free API key from [openweathermap.org](https://openweathermap.org/api)
2. Copy the example env file:

```bash
cp .env.local.example .env.local
```

3. Edit `.env.local` and add your key:

```
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
```

> The key is only read server-side by the `/api/weather` Route Handler — it is never sent to the browser.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add `NEXT_PUBLIC_WEATHER_API_KEY` as an environment variable
4. Deploy

### Replit

1. Go to [replit.com](https://replit.com) and create a new Repl from the GitHub URL
2. Add `NEXT_PUBLIC_WEATHER_API_KEY` to Replit Secrets
3. The dev server is pre-configured for Replit on port 5000 (`npm run dev`)

## Project Structure

```
├── app/
│   ├── api/
│   │   └── weather/
│   │       └── route.ts      # Server-side proxy for OpenWeatherMap API
│   ├── page.tsx              # Main page — layout, data fetching, CSS Grid structure
│   ├── layout.tsx            # Root layout — Space Mono font, PWA metadata
│   └── globals.css           # Global styles — dot matrix, glass morphism panels
├── components/
│   ├── WeatherCard.tsx       # Temperature (96px) + weather icon (112px) + description
│   ├── DigitalClock.tsx      # Live 96px clock with blinking red colon; timezone-aware
│   ├── HourlyForecast.tsx    # 24-hour scrollable forecast inside glass card
│   ├── WeeklyForecast.tsx    # 6-day forecast with range bars + temperature trend graph
│   ├── WeatherInfoCards.tsx  # SunriseSunsetCard, WeatherDetailsCards, and six
│   │                         # SVG infographic cards (Wind, Humidity, Pressure,
│   │                         # Visibility, AirQuality)
│   ├── WeatherIcon.tsx       # Condition-mapped SVG weather icons
│   ├── LocationSearch.tsx    # City search with suggestions and geolocation button
│   ├── ThemeToggle.tsx       # Light / dark mode toggle
│   └── LoadingSkeleton.tsx   # Shimmer loading states
├── lib/
│   └── weather.ts            # OpenWeatherMap API calls + mock data fallback
└── public/
    ├── manifest.json         # PWA manifest
    ├── icons/                # App icons (SVG + PNG)
    └── weather/              # Weather condition assets
```

## Layout

The desktop layout uses a unified two-column CSS Grid. Mobile stacks all cards in a single column with explicit ordering:

```
┌─────────────────────────┬─────────────────────────┐
│  Temperature + Icon     │  Digital Clock          │  ← Row 1
│  Feels like / Desc      │  (location local time)  │
├─────────────────────────┼─────────────────────────┤
│  Sunrise & Sunset       │  Hourly Forecast        │  ← Row 2
│  [daylight + arc]       │  [24h scroll]           │
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
