import { useTripsStore } from "../../store/useTripsStore";
import { useWeatherStore } from "../../store/useWeatherStore";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CloudRain,
  AlertCircle,
  RefreshCw,
  Wind,
  Sun,
  Moon,
} from "lucide-react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { getWeatherIcon } from "../../api/weatherApi";

interface WeatherWidgetProps {
  tripId: string;
}

export const WeatherWidget = ({ tripId }: WeatherWidgetProps) => {
  const trip = useTripsStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const { fetchTripWeather } = useWeatherStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    // Immediate fetch on mount if no weather data
    if (trip && !trip.weather) {
      setIsLoading(true);
      fetchTripWeather(tripId).finally(() => {
        setIsLoading(false);
        setHasAttemptedFetch(true);
      });
    }
  }, [tripId, trip?.weather, fetchTripWeather]);

  const handleRetry = async () => {
    setIsLoading(true);
    setHasAttemptedFetch(false);
    await fetchTripWeather(tripId).finally(() => {
      setIsLoading(false);
      setHasAttemptedFetch(true);
    });
  };

  if (!trip) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Fetching latest forecast for {trip.destination}...
        </Typography>
      </Box>
    );
  }

  // Error state - no weather data after fetch attempt
  if (hasAttemptedFetch && (!trip.weather || trip.weather.length === 0)) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          textAlign: "center",
          gap: 2,
        }}
      >
        <AlertCircle size={48} color="#9ca3af" />
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Weather Unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={400}>
          We couldn't find weather data for "{trip.destination}". We tried
          looking up the specific location and broader regions.
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRetry}
          startIcon={<RefreshCw size={16} />}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  // Success state - display weather
  if (trip.weather && trip.weather.length > 0) {
    const todayWeather = trip.weather[0];

    return (
      <Box sx={{ pb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="800"
              color="primary.900"
              gutterBottom
            >
              Weather Forecast
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {trip.destination} • {format(new Date(trip.startDate), "MMM d")} -{" "}
              {format(new Date(trip.endDate), "MMM d, yyyy")}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleRetry}
            startIcon={<RefreshCw size={16} />}
            size="small"
          >
            Refresh
          </Button>
        </Box>

        {/* Current Weather Hero */}
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
              {getWeatherIcon(todayWeather.weatherCode)}
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
                  {getWeatherIcon(todayWeather.weatherCode)}
                </Typography>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="500"
                    sx={{ opacity: 0.9 }}
                  >
                    Today, {format(parseISO(todayWeather.date), "MMMM d")}
                  </Typography>
                  <Typography variant="h2" fontWeight="800">
                    {Math.round(todayWeather.maxTemp)}°
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.8 }}>
                    Low: {Math.round(todayWeather.minTemp)}°
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
                      {todayWeather.precipitationProbability}%
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
                      {todayWeather.windSpeedMax
                        ? Math.round(todayWeather.windSpeedMax)
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
                      {todayWeather.uvIndexMax?.toFixed(1) || "--"}
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
                      {todayWeather.sunrise
                        ? format(new Date(todayWeather.sunrise), "HH:mm")
                        : "--"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          Daily Forecast
        </Typography>

        <Grid container spacing={2}>
          {trip.weather.map((day) => (
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
  }

  return null;
};
