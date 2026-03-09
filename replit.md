# Nothing Weather — Replit Guide

A Nothing OS–inspired weather web app built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion v11
- **Data**: OpenWeatherMap API (proxied server-side)
- **Font**: Space Mono

## Running on Replit

The dev server runs on port 5000, bound to `0.0.0.0` for Replit compatibility:

```bash
npm run dev
```

This is equivalent to `next dev -p 5000 -H 0.0.0.0`.

## Environment Variables

Add the following to **Replit Secrets**:

| Secret | Description |
|---|---|
| `NEXT_PUBLIC_WEATHER_API_KEY` | Free API key from [openweathermap.org](https://openweathermap.org/api) |

> The app works without an API key — it falls back to mock Melbourne weather data automatically.

## Project Structure

```
├── app/
│   ├── api/weather/route.ts  # Server-side OpenWeatherMap proxy (keeps key secret)
│   ├── page.tsx              # Main page
│   ├── layout.tsx            # Root layout + PWA metadata
│   └── globals.css           # Global styles
├── components/               # All UI components
├── lib/weather.ts            # API helpers + mock data fallback
└── public/                   # Icons, PWA manifest
```

## Notes

- Port: 5000 (configured for Replit; change to 3000 for standard local dev)
- API key is read server-side only — never exposed to the browser
- Mock data (Melbourne) is used automatically if the API key is missing or the request fails
- Package manager: npm
