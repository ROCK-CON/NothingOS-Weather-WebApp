# Nothing Weather

A clean, minimal weather app built with Next.js 14, React, Tailwind CSS, and Framer Motion. Displays current conditions and forecasts using the OpenWeatherMap API.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, Lottie React
- **Data**: OpenWeatherMap API (via `NEXT_PUBLIC_WEATHER_API_KEY` secret)
- **Language**: TypeScript

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - UI components (WeatherCard, HourlyForecast, WeeklyForecast, etc.)
- `lib/weather.ts` - Weather API utility functions

## Running

The dev server runs on port 5000 (`npm run dev`). This is configured for Replit compatibility.

## Environment Variables

- `NEXT_PUBLIC_WEATHER_API_KEY` - OpenWeatherMap API key (required, set as a secret)

## Notes

- Migrated from Vercel to Replit — port changed to 5000, host set to 0.0.0.0
- Package manager: npm
