import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

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

// ─── Mock Data ────────────────────────────────────────────────────────────────

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
  ];
  const icons = ["02d", "10d", "03d", "01d", "11d", "01d", "02d"];
  const now = new Date();

  return Array.from({ length: 7 }, (_, i) => {
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
      precipitation: [0, 0.9, 0.4, 0, 0.7, 0, 0.1][i],
    };
  });
})();

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  if (!API_KEY) {
    console.warn("No API key – using mock data");
    return { ...mockCurrentWeather, city };
  }

  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
      },
    });

    const data = response.data;

    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description:
        data.weather[0].description.charAt(0).toUpperCase() +
        data.weather[0].description.slice(1),
      condition: mapCondition(data.weather[0].id, data.weather[0].icon),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      windDeg: data.wind?.deg ?? 0,
      visibility: data.visibility,
      pressure: data.main.pressure,
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      dt: data.dt,
      aqi: 1,
      lat: data.coord.lat,
      lon: data.coord.lon,
    };
  } catch {
    console.warn("API error – using mock data");
    return { ...mockCurrentWeather, city };
  }
}

export async function getCurrentWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherData> {
  if (!API_KEY) {
    return mockCurrentWeather;
  }

  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: "metric",
      },
    });

    const data = response.data;

    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description:
        data.weather[0].description.charAt(0).toUpperCase() +
        data.weather[0].description.slice(1),
      condition: mapCondition(data.weather[0].id, data.weather[0].icon),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      windDeg: data.wind?.deg ?? 0,
      visibility: data.visibility,
      pressure: data.main.pressure,
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      dt: data.dt,
      aqi: 1,
      lat: data.coord.lat,
      lon: data.coord.lon,
    };
  } catch {
    return mockCurrentWeather;
  }
}

export async function getForecast(city: string): Promise<{
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}> {
  if (!API_KEY) {
    return { hourly: mockHourly, daily: mockDaily };
  }

  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
        cnt: 40,
      },
    });

    const items = response.data.list;

    const hourly: HourlyForecastItem[] = items.slice(0, 24).map(
      (item: {
        dt: number;
        main: { temp: number };
        weather: Array<{ id: number; icon: string; description: string }>;
        pop: number;
      }) => ({
        time: item.dt,
        temperature: Math.round(item.main.temp),
        condition: mapCondition(item.weather[0].id, item.weather[0].icon),
        icon: item.weather[0].icon,
        description: item.weather[0].description,
        precipitation: Math.round(item.pop * 100),
      })
    );

    // Group by day for daily forecast
    const dayMap = new Map<string, typeof items>();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    items.forEach(
      (item: {
        dt: number;
        main: { temp_max: number; temp_min: number };
        weather: Array<{ id: number; icon: string; description: string }>;
        pop: number;
      }) => {
        const date = new Date(item.dt * 1000);
        const key = date.toDateString();
        if (!dayMap.has(key)) dayMap.set(key, []);
        dayMap.get(key)!.push(item);
      }
    );

    const daily: DailyForecastItem[] = [];
    let i = 0;
    dayMap.forEach((dayItems, key) => {
      if (daily.length >= 7) return;
      const temps = dayItems.map(
        (d: { main: { temp: number } }) => d.main.temp
      );
      const midday = dayItems[Math.floor(dayItems.length / 2)];
      const date = new Date(midday.dt * 1000);
      daily.push({
        date: midday.dt,
        dayName: i === 0 ? "Today" : dayNames[date.getDay()],
        high: Math.round(Math.max(...temps)),
        low: Math.round(Math.min(...temps)),
        condition: mapCondition(
          midday.weather[0].id,
          midday.weather[0].icon
        ),
        icon: midday.weather[0].icon,
        description: midday.weather[0].description,
        precipitation: Math.round(midday.pop * 100),
      });
      i++;
    });

    return { hourly, daily };
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
  if (!API_KEY) {
    return { hourly: mockHourly, daily: mockDaily };
  }

  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: "metric",
        cnt: 40,
      },
    });

    const items = response.data.list;

    const hourly: HourlyForecastItem[] = items.slice(0, 24).map(
      (item: {
        dt: number;
        main: { temp: number };
        weather: Array<{ id: number; icon: string; description: string }>;
        pop: number;
      }) => ({
        time: item.dt,
        temperature: Math.round(item.main.temp),
        condition: mapCondition(item.weather[0].id, item.weather[0].icon),
        icon: item.weather[0].icon,
        description: item.weather[0].description,
        precipitation: Math.round(item.pop * 100),
      })
    );

    const dayMap = new Map<string, typeof items>();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    items.forEach(
      (item: {
        dt: number;
        main: { temp_max: number; temp_min: number };
        weather: Array<{ id: number; icon: string; description: string }>;
        pop: number;
      }) => {
        const date = new Date(item.dt * 1000);
        const key = date.toDateString();
        if (!dayMap.has(key)) dayMap.set(key, []);
        dayMap.get(key)!.push(item);
      }
    );

    const daily: DailyForecastItem[] = [];
    let i = 0;
    dayMap.forEach((dayItems) => {
      if (daily.length >= 7) return;
      const temps = dayItems.map(
        (d: { main: { temp: number } }) => d.main.temp
      );
      const midday = dayItems[Math.floor(dayItems.length / 2)];
      const date = new Date(midday.dt * 1000);
      daily.push({
        date: midday.dt,
        dayName: i === 0 ? "Today" : dayNames[date.getDay()],
        high: Math.round(Math.max(...temps)),
        low: Math.round(Math.min(...temps)),
        condition: mapCondition(midday.weather[0].id, midday.weather[0].icon),
        icon: midday.weather[0].icon,
        description: midday.weather[0].description,
        precipitation: Math.round(midday.pop * 100),
      });
      i++;
    });

    return { hourly, daily };
  } catch {
    return { hourly: mockHourly, daily: mockDaily };
  }
}
