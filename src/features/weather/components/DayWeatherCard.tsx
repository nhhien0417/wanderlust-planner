import { CloudRain, Thermometer } from "lucide-react";
import { Box, Typography, Paper } from "@mui/material";
import { getWeatherIcon } from "../../../api/weatherApi";
import type { Trip } from "../../../types";

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
    if (isNaN(d.getTime())) return dateInput; // Return original if invalid
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
        p: 1.5,
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(4px)",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        maxWidth: 110,
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
          bgcolor: "white",
          boxShadow: 1,
        },
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
        <Typography variant="h3" sx={{ fontSize: "2rem", lineHeight: 1 }}>
          {getWeatherIcon(dayWeather.weatherCode)}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Thermometer size={14} className="text-red-500" />
          <Typography variant="body2" fontWeight="700" color="text.primary">
            {Math.round(dayWeather.maxTemp)}°
          </Typography>
          <Typography variant="caption" color="text.secondary">
            /{Math.round(dayWeather.minTemp)}°
          </Typography>
        </Box>

        {dayWeather.precipitationProbability > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "primary.50",
              px: 0.8,
              py: 0.2,
              borderRadius: 1,
            }}
          >
            <CloudRain size={12} className="text-blue-500" />
            <Typography variant="caption" color="primary.700" fontWeight="700">
              {dayWeather.precipitationProbability}%
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
