# Nothing Weather

A Nothing OS inspired weather web application built with Next.js 14. Minimal monochrome UI, dot matrix aesthetic, and smooth animations — inspired by the weather app on the Nothing Phone.

![Nothing Weather App](public/icons/icon.svg)

## Features

- Current weather conditions with large temperature display
- 24-hour horizontally scrollable hourly forecast
- 7-day weekly forecast with temperature range bars
- City search with quick-select suggestions
- Geolocation support — auto-loads local weather if permission granted
- Mock data fallback — works without an API key
- Loading skeleton UI while fetching data
- PWA ready — installable on mobile

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **API:** OpenWeatherMap
- **HTTP:** Axios
- **Font:** Space Mono

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

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add `NEXT_PUBLIC_WEATHER_API_KEY` as an environment variable
4. Deploy

### Replit

1. Go to [replit.com](https://replit.com) and create a new Repl from the GitHub URL
2. Add `NEXT_PUBLIC_WEATHER_API_KEY` to Replit Secrets
3. Set the run command to `npm run dev`

## Project Structure

```
├── app/
│   ├── page.tsx          # Main page — weather loading and layout
│   ├── layout.tsx        # Root layout — fonts and PWA metadata
│   └── globals.css       # Global styles — dot matrix, glass panels
├── components/
│   ├── WeatherCard.tsx   # Current weather — temp, stats grid
│   ├── HourlyForecast.tsx # Scrollable 24-hour forecast
│   ├── WeeklyForecast.tsx # 7-day forecast with temp bars
│   ├── WeatherIcon.tsx   # SVG weather icons
│   ├── LocationSearch.tsx # City search and geolocation
│   └── LoadingSkeleton.tsx # Shimmer loading states
├── lib/
│   └── weather.ts        # OpenWeatherMap API + mock data
└── public/
    ├── manifest.json     # PWA manifest
    └── icons/            # App icons
```

## Design

Inspired by the Nothing Phone OS aesthetic:

- Background: `#000000`
- Primary text: `#FFFFFF`
- Secondary text: `#8A8A8A`
- Font: Space Mono
- Dot matrix background pattern
- Glass morphism panels

## License

MIT
