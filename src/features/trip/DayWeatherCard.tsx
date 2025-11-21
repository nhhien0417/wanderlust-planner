import { CloudRain, Thermometer } from "lucide-react";
import { Box, Typography, Paper } from "@mui/material";
import { getWeatherIcon } from "../../api/weatherApi";
import type { Trip } from "../../types";

interface DayWeatherCardProps {
  date: string;
  weather?: Trip["weather"];
}

export const DayWeatherCard = ({ date, weather }: DayWeatherCardProps) => {
  if (!weather) return null;

  const dayWeather = weather.find((w) => w.date === date.split("T")[0]);
  if (!dayWeather) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        mb: 2,
        background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "primary.100",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h3" sx={{ fontSize: "2rem" }}>
          {getWeatherIcon(dayWeather.weatherCode)}
        </Typography>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Thermometer size={16} style={{ color: "#ef4444" }} />
            <Typography variant="body2" fontWeight="bold" color="primary.900">
              {Math.round(dayWeather.maxTemp)}° /{" "}
              {Math.round(dayWeather.minTemp)}°
            </Typography>
          </Box>

          {dayWeather.precipitationProbability > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CloudRain size={14} style={{ color: "#3b82f6" }} />
              <Typography variant="caption" color="info.main" fontWeight="600">
                {dayWeather.precipitationProbability}% rain
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
