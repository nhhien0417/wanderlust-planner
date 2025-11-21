import { CloudRain, Thermometer } from "lucide-react";
import { Box, Typography, Paper } from "@mui/material";
import { getWeatherIcon } from "../api/weatherApi";
import type { Trip } from "../types";

interface DayWeatherCardProps {
  date: string;
  weather?: Trip["weather"];
}

export const DayWeatherCard = ({ date, weather }: DayWeatherCardProps) => {
  if (!weather) return null;

  // Normalize date to yyyy-MM-dd format for comparison
  const normalizeDateString = (dateInput: string): string => {
    // If already in yyyy-MM-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return dateInput;
    }
    // If ISO format (with T), extract date part
    if (dateInput.includes("T")) {
      return dateInput.split("T")[0];
    }
    // Try parsing as Date and format
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dateStr = normalizeDateString(date);
  const dayWeather = weather.find((w) => w.date === dateStr);

  if (!dayWeather) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "primary.100",
        maxWidth: 100,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Typography variant="h4" sx={{ fontSize: "1.5rem" }}>
          {getWeatherIcon(dayWeather.weatherCode)}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Thermometer size={12} style={{ color: "#ef4444" }} />
          <Typography variant="caption" fontWeight="bold" color="primary.900">
            {Math.round(dayWeather.maxTemp)}°/{Math.round(dayWeather.minTemp)}°
          </Typography>
        </Box>

        {dayWeather.precipitationProbability > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CloudRain size={10} style={{ color: "#3b82f6" }} />
            <Typography
              variant="caption"
              color="info.main"
              fontSize="0.65rem"
              fontWeight="600"
            >
              {dayWeather.precipitationProbability}%
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
