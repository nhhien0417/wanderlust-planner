import { format } from "date-fns";

export interface WeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitationProbability: number;
  weatherCode: number;
}

export const getCoordinates = async (
  city: string
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1&language=en&format=json`
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
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

export const getWeatherForecast = async (
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<WeatherData[]> => {
  try {
    const start = format(new Date(startDate), "yyyy-MM-dd");
    const end = format(new Date(endDate), "yyyy-MM-dd");

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&start_date=${start}&end_date=${end}`
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
    }));
  } catch (error) {
    console.error("Error fetching weather:", error);
    return [];
  }
};

export const getWeatherIcon = (code: number) => {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return "☀️"; // Clear sky
  if (code >= 1 && code <= 3) return "⛅"; // Mainly clear, partly cloudy, and overcast
  if (code >= 45 && code <= 48) return "🌫️"; // Fog
  if (code >= 51 && code <= 55) return "🌧️"; // Drizzle
  if (code >= 61 && code <= 65) return "🌧️"; // Rain
  if (code >= 71 && code <= 77) return "❄️"; // Snow
  if (code >= 80 && code <= 82) return "🌧️"; // Rain showers
  if (code >= 95 && code <= 99) return "⚡"; // Thunderstorm
  return "❓";
};
