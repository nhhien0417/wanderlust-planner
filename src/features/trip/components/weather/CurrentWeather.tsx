import { Box, Typography, Paper, Grid } from "@mui/material";
import { CloudRain, Wind, Sun, Moon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getWeatherIcon } from "../../../../api/weatherApi";
import type { WeatherData } from "../../../../api/weatherApi";

interface CurrentWeatherProps {
  weather: WeatherData;
}

export const CurrentWeather = ({ weather }: CurrentWeatherProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        borderRadius: 4,
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          opacity: 0.1,
          transform: "rotate(15deg)",
          pointerEvents: "none",
        }}
      >
        <Typography variant="h1" fontSize="18rem">
          {getWeatherIcon(weather.weatherCode)}
        </Typography>
      </Box>

      <Grid
        container
        spacing={4}
        alignItems="center"
        position="relative"
        zIndex={1}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Typography variant="h1" sx={{ fontSize: "6rem" }}>
              {getWeatherIcon(weather.weatherCode)}
            </Typography>
            <Box>
              <Typography variant="h6" fontWeight="500" sx={{ opacity: 0.9 }}>
                Today, {format(parseISO(weather.date), "MMMM d")}
              </Typography>
              <Typography variant="h2" fontWeight="800">
                {Math.round(weather.maxTemp)}°
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                Low: {Math.round(weather.minTemp)}°
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: 2,
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    opacity: 0.8,
                  }}
                >
                  <CloudRain size={18} />
                  <Typography variant="body2" fontWeight="600">
                    Precipitation
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="700">
                  {weather.precipitationProbability}%
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: 2,
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    opacity: 0.8,
                  }}
                >
                  <Wind size={18} />
                  <Typography variant="body2" fontWeight="600">
                    Wind
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="700">
                  {weather.windSpeedMax
                    ? Math.round(weather.windSpeedMax)
                    : "--"}{" "}
                  <Typography component="span" variant="caption">
                    km/h
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: 2,
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    opacity: 0.8,
                  }}
                >
                  <Sun size={18} />
                  <Typography variant="body2" fontWeight="600">
                    UV Index
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="700">
                  {weather.uvIndexMax?.toFixed(1) || "--"}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: 2,
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    opacity: 0.8,
                  }}
                >
                  <Moon size={18} />
                  <Typography variant="body2" fontWeight="600">
                    Sunrise
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="700">
                  {weather.sunrise
                    ? format(parseISO(weather.sunrise), "HH:mm")
                    : "--"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};
