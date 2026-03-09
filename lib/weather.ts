export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  visibility: number;
  pressure: number;
  icon: string;
  sunrise: number;
  sunset: number;
  dt: number;
  aqi: number;
  lat: number;
  lon: number;
  timezoneOffset: number;
}

export interface HourlyForecastItem {
  time: number;
  temperature: number;
  condition: WeatherCondition;
  icon: string;
  description: string;
  precipitation: number;
}

export interface DailyForecastItem {
  date: number;
  dayName: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  icon: string;
  description: string;
  precipitation: number;
}

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "partly-cloudy"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "mist"
  | "drizzle";

function mapCondition(weatherId: number, icon: string): WeatherCondition {
  if (weatherId >= 200 && weatherId < 300) return "thunderstorm";
  if (weatherId >= 300 && weatherId < 400) return "drizzle";
  if (weatherId >= 500 && weatherId < 600) return "rain";
  if (weatherId >= 600 && weatherId < 700) return "snow";
  if (weatherId >= 700 && weatherId < 800) return "mist";
  if (weatherId === 800) return "clear";
  if (weatherId === 801 || weatherId === 802) return "partly-cloudy";
  if (weatherId >= 803) return "cloudy";
  return "clear";
}

const mockCurrentWeather: WeatherData = {
  city: "Melbourne",
  country: "AU",
  temperature: 22,
  feelsLike: 20,
  description: "Partly Cloudy",
  condition: "partly-cloudy",
  humidity: 58,
  windSpeed: 14,
  windDeg: 275,
  visibility: 10000,
  pressure: 1015,
  icon: "02d",
  sunrise: Date.now() / 1000 - 3600 * 4,
  sunset: Date.now() / 1000 + 3600 * 4,
  dt: Date.now() / 1000,
  aqi: 2,
  lat: -37.8136,
  lon: 144.9631,
  timezoneOffset: 36000,
};

const mockHourly: HourlyForecastItem[] = Array.from({ length: 24 }, (_, i) => {
  const conditions: WeatherCondition[] = [
    "partly-cloudy",
    "cloudy",
    "rain",
    "partly-cloudy",
    "clear",
    "cloudy",
  ];
  const icons = ["02d", "03d", "10d", "02d", "01d", "03d"];
  const idx = i % conditions.length;
  return {
    time: Date.now() / 1000 + i * 3600,
    temperature: Math.round(18 + Math.sin((i * Math.PI) / 12) * 6),
    condition: conditions[idx],
    icon: icons[idx],
    description: conditions[idx].replace("-", " "),
    precipitation: idx === 2 ? 0.8 : 0,
  };
});

const mockDaily: DailyForecastItem[] = (() => {
  const days = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];
  const conditions: WeatherCondition[] = [
    "partly-cloudy",
    "rain",
    "cloudy",
    "clear",
    "thunderstorm",
    "clear",
    "partly-cloudy",
    "rain",
    "cloudy",
    "clear",
  ];
  const icons = ["02d", "10d", "03d", "01d", "11d", "01d", "02d", "10d", "03d", "01d"];
  const now = new Date();

  return Array.from({ length: 10 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    return {
      date: date.getTime() / 1000,
      dayName: i === 0 ? "Today" : days[date.getDay()],
      high: Math.round(20 + Math.random() * 8),
      low: Math.round(12 + Math.random() * 5),
      condition: conditions[i],
      icon: icons[i],
      description: conditions[i].replace("-", " "),
      precipitation: [0, 0.9, 0.4, 0, 0.7, 0, 0.1, 0.6, 0.2, 0][i],
    };
  });
})();

async function fetchFromApi(endpoint: string, params: Record<string, string>) {
  const url = new URL("/api/weather", window.location.origin);
  url.searchParams.set("endpoint", endpoint);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${response.status}`);
  }
  return response.json();
}

function parseWeatherResponse(data: Record<string, unknown>): WeatherData {
  const main = data.main as Record<string, number>;
  const wind = data.wind as Record<string, number>;
  const sys = data.sys as Record<string, unknown>;
  const coord = data.coord as Record<string, number>;
  const weatherArr = data.weather as Array<Record<string, unknown>>;
  const w = weatherArr[0];

  return {
    city: data.name as string,
    country: sys.country as string,
    temperature: Math.round(main.temp),
    feelsLike: Math.round(main.feels_like),
    description:
      (w.description as string).charAt(0).toUpperCase() +
      (w.description as string).slice(1),
    condition: mapCondition(w.id as number, w.icon as string),
    humidity: main.humidity,
    windSpeed: Math.round((wind.speed ?? 0) * 3.6),
    windDeg: wind.deg ?? 0,
    visibility: data.visibility as number,
    pressure: main.pressure,
    icon: w.icon as string,
    sunrise: (sys.sunrise as number),
    sunset: (sys.sunset as number),
    dt: data.dt as number,
    aqi: 1,
    lat: coord.lat,
    lon: coord.lon,
    timezoneOffset: data.timezone as number,
  };
}

function parseForecastResponse(data: Record<string, unknown>): {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
} {
  const items = (data.list as Array<Record<string, unknown>>);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const hourly: HourlyForecastItem[] = items.slice(0, 24).map((item) => {
    const main = item.main as Record<string, number>;
    const weatherArr = item.weather as Array<Record<string, unknown>>;
    const w = weatherArr[0];
    return {
      time: item.dt as number,
      temperature: Math.round(main.temp),
      condition: mapCondition(w.id as number, w.icon as string),
      icon: w.icon as string,
      description: w.description as string,
      precipitation: Math.round((item.pop as number) * 100),
    };
  });

  const dayMap = new Map<string, Array<Record<string, unknown>>>();
  items.forEach((item) => {
    const date = new Date((item.dt as number) * 1000);
    const key = date.toDateString();
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push(item);
  });

  const daily: DailyForecastItem[] = [];
  let i = 0;
  dayMap.forEach((dayItems) => {
    if (daily.length >= 10) return;
    const temps = dayItems.map((d) => (d.main as Record<string, number>).temp);
    const midday = dayItems[Math.floor(dayItems.length / 2)];
    const date = new Date((midday.dt as number) * 1000);
    const middayWeather = (midday.weather as Array<Record<string, unknown>>)[0];
    daily.push({
      date: midday.dt as number,
      dayName: i === 0 ? "Today" : dayNames[date.getDay()],
      high: Math.round(Math.max(...temps)),
      low: Math.round(Math.min(...temps)),
      condition: mapCondition(middayWeather.id as number, middayWeather.icon as string),
      icon: middayWeather.icon as string,
      description: middayWeather.description as string,
      precipitation: Math.round((midday.pop as number) * 100),
    });
    i++;
  });

  return { hourly, daily };
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  try {
    const data = await fetchFromApi("weather", { city });
    return parseWeatherResponse(data);
  } catch {
    console.warn("API error – using mock data");
    return { ...mockCurrentWeather, city };
  }
}

export async function getCurrentWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherData> {
  try {
    const data = await fetchFromApi("weather", {
      lat: lat.toString(),
      lon: lon.toString(),
    });
    return parseWeatherResponse(data);
  } catch {
    return mockCurrentWeather;
  }
}

export async function getForecast(city: string): Promise<{
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}> {
  try {
    const data = await fetchFromApi("forecast", { city });
    return parseForecastResponse(data);
  } catch {
    return { hourly: mockHourly, daily: mockDaily };
  }
}

export async function getForecastByCoords(
  lat: number,
  lon: number
): Promise<{
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}> {
  try {
    const data = await fetchFromApi("forecast", {
      lat: lat.toString(),
      lon: lon.toString(),
    });
    return parseForecastResponse(data);
  } catch {
    return { hourly: mockHourly, daily: mockDaily };
  }
}
