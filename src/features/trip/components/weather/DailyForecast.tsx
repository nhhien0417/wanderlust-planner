import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { CloudRain } from "lucide-react";
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
                <Typography variant="h2" sx={{ my: 2 }}>
                  {getWeatherIcon(day.weatherCode)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 0.5,
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {Math.round(day.maxTemp)}°
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    /{Math.round(day.minTemp)}°
                  </Typography>
                </Box>
                {day.precipitationProbability > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "primary.main",
                      bgcolor: "primary.50",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    <CloudRain size={14} />
                    <Typography variant="caption" fontWeight="bold">
                      {day.precipitationProbability}%
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
