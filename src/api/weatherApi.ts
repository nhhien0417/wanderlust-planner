import { format, addDays, isAfter } from "date-fns";

export interface WeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitationProbability: number;
  weatherCode: number;
  sunrise?: string;
  sunset?: string;
  uvIndexMax?: number;
  windSpeedMax?: number;
  humidityMax?: number;
}

export const getCoordinates = async (
  city: string
): Promise<{ lat: number; lng: number } | null> => {
  const fetchCoords = async (query: string) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=5&format=json`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return {
          lat: data.results[0].latitude,
          lng: data.results[0].longitude,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching coordinates for ${query}:`, error);
      return null;
    }
  };

  // 1. Try exact match (now without language restriction)
  let coords = await fetchCoords(city);
  if (coords) return coords;

  // 2. Try splitting by comma (e.g., "Location, City, Country")
  const parts = city.split(",").map((p) => p.trim());

  // Try the last part (usually Country)
  if (parts.length > 1) {
    coords = await fetchCoords(parts[parts.length - 1]);
    if (coords) return coords;
  }

  // Try the second to last part (usually City or Region)
  if (parts.length > 2) {
    coords = await fetchCoords(parts[parts.length - 2]);
    if (coords) return coords;
  }

  // 3. Try cleaning up "Location at " prefix if present
  if (city.toLowerCase().startsWith("location at ")) {
    const cleaned = city.substring(12).trim();
    coords = await fetchCoords(cleaned);
    if (coords) return coords;

    // Try splitting the cleaned version
    const cleanedParts = cleaned.split(",").map((p) => p.trim());
    if (cleanedParts.length > 1) {
      coords = await fetchCoords(cleanedParts[cleanedParts.length - 1]);
      if (coords) return coords;
    }
  }

  return null;
};

export const getWeatherForecast = async (
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<WeatherData[]> => {
  try {
    const start = new Date(startDate);
    let end = new Date(endDate);
    const today = new Date();

    // Open-Meteo usually provides 14-16 days forecast.
    // Clamp endDate to today + 14 days to avoid errors for long trips.
    const maxForecastDate = addDays(today, 14);

    if (isAfter(end, maxForecastDate)) {
      end = maxForecastDate;
    }

    // If start date is also beyond max forecast, we can't fetch anything useful yet.
    // But let's try to fetch what we can.
    if (isAfter(start, maxForecastDate)) {
      return [];
    }

    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_speed_10m_max&timezone=auto&start_date=${startStr}&end_date=${endStr}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();

    return data.daily.time.map((time: string, index: number) => ({
      date: time,
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
      precipitationProbability: data.daily.precipitation_probability_max[index],
      weatherCode: data.daily.weather_code[index],
      sunrise: data.daily.sunrise[index],
      sunset: data.daily.sunset[index],
      uvIndexMax: data.daily.uv_index_max[index],
      windSpeedMax: data.daily.wind_speed_10m_max[index],
    }));
  } catch (error) {
    console.error("Error fetching weather:", error);
    return [];
  }
};

export const getWeatherIcon = (code: number) => {
  // WMO Weather interpretation codes (WW)
  // Code 0: Clear sky
  if (code === 0) return "☀️";

  // Code 1, 2, 3: Mainly clear, partly cloudy, and overcast
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";

  // Code 45, 48: Fog and depositing rime fog
  if (code === 45 || code === 48) return "🌫️";

  // Code 51, 53, 55: Drizzle: Light, moderate, and dense intensity
  if (code >= 51 && code <= 55) return "🌦️";

  // Code 56, 57: Freezing Drizzle: Light and dense intensity
  if (code === 56 || code === 57) return "🌨️";

  // Code 61, 63, 65: Rain: Slight, moderate and heavy intensity
  if (code === 61) return "🌦️";
  if (code === 63) return "🌧️";
  if (code === 65) return "🌧️";

  // Code 66, 67: Freezing Rain: Light and heavy intensity
  if (code === 66 || code === 67) return "🌨️";

  // Code 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
  if (code >= 71 && code <= 75) return "❄️";

  // Code 77: Snow grains
  if (code === 77) return "❄️";

  // Code 80, 81, 82: Rain showers: Slight, moderate, and violent
  if (code >= 80 && code <= 82) return "🌧️";

  // Code 85, 86: Snow showers slight and heavy
  if (code === 85 || code === 86) return "❄️";

  // Code 95: Thunderstorm: Slight or moderate
  if (code === 95) return "⚡";

  // Code 96, 99: Thunderstorm with slight and heavy hail
  if (code === 96 || code === 99) return "⛈️";

  return "🌡️"; // Default fallback
};
