import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { CloudRain, Wind } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getWeatherIcon } from "../../../../api/weatherApi";
import type { WeatherData } from "../../../../api/weatherApi";

interface DailyForecastProps {
  forecast: WeatherData[];
}

export const DailyForecast = ({ forecast }: DailyForecastProps) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        Daily Forecast
      </Typography>

      <Grid container spacing={2}>
        {forecast.map((day) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={day.date}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                  borderColor: "primary.200",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 2,
                  "&:last-child": { pb: 2 },
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color="text.secondary"
                  gutterBottom
                >
                  {format(parseISO(day.date), "EEE, MMM d")}
                </Typography>
                <Typography variant="h3" sx={{ my: 1 }}>
                  {getWeatherIcon(day.weatherCode)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 0.5,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {Math.round(day.maxTemp)}°
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    /{Math.round(day.minTemp)}°
                  </Typography>
                </Box>

                <Grid container spacing={1} sx={{ width: "100%" }}>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        bgcolor: "grey.50",
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      <CloudRain size={14} color="#3b82f6" />
                      <Typography variant="caption" fontWeight="bold" mt={0.5}>
                        {day.precipitationProbability}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        bgcolor: "grey.50",
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      <Wind size={14} color="#64748b" />
                      <Typography variant="caption" fontWeight="bold" mt={0.5}>
                        {day.windSpeedMax ? Math.round(day.windSpeedMax) : "--"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
