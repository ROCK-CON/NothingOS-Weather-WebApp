import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  if (!endpoint || !["weather", "forecast"].includes(endpoint)) {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }

  const params: Record<string, string> = {
    appid: API_KEY,
    units: "metric",
  };

  if (city) {
    params.q = city;
  } else if (lat && lon) {
    params.lat = lat;
    params.lon = lon;
  } else {
    return NextResponse.json({ error: "City or coordinates required" }, { status: 400 });
  }

  if (endpoint === "forecast") {
    params.cnt = "40";
  }

  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}`, { params });
    return NextResponse.json(response.data);
  } catch (err: unknown) {
    const status = axios.isAxiosError(err) ? err.response?.status ?? 500 : 500;
    const message = axios.isAxiosError(err) ? err.response?.data?.message ?? "API request failed" : "API request failed";
    return NextResponse.json({ error: message }, { status });
  }
}
