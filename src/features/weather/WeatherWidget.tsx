import { useTripsStore } from "../../store/useTripsStore";
import { useWeatherStore } from "../../store/useWeatherStore";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CloudRain, Thermometer, AlertCircle, RefreshCw } from "lucide-react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
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
    if (trip && !trip.weather && !hasAttemptedFetch) {
      setIsLoading(true);
      fetchTripWeather(tripId).finally(() => {
        setIsLoading(false);
        setHasAttemptedFetch(true);
      });
    }
  }, [tripId, trip?.weather, fetchTripWeather, hasAttemptedFetch]);

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
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "primary.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={24} />
        <Typography variant="body1" color="primary.900">
          Fetching weather forecast...
        </Typography>
      </Paper>
    );
  }

  // Error state - no weather data after fetch attempt
  if (hasAttemptedFetch && (!trip.weather || trip.weather.length === 0)) {
    return (
      <Alert
        severity="warning"
        sx={{ mb: 3 }}
        icon={<AlertCircle size={24} />}
        action={
          <Button
            size="small"
            onClick={handleRetry}
            startIcon={<RefreshCw size={16} />}
            sx={{ textTransform: "none" }}
          >
            Retry
          </Button>
        }
      >
        <Typography variant="subtitle2" fontWeight="bold">
          Weather forecast unavailable
        </Typography>
        <Typography variant="body2">
          Could not fetch weather data for "{trip.destination}". Please check
          the destination name or try selecting the location on the map when
          creating a trip.
        </Typography>
      </Alert>
    );
  }

  // Success state - display weather
  if (trip.weather && trip.weather.length > 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "primary.100",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary.900">
            Weather Forecast
          </Typography>
          <Typography variant="body2" color="primary.700">
            ({trip.destination})
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1,
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: 3,
            },
          }}
        >
          {trip.weather.map((day) => (
            <Paper
              key={day.date}
              elevation={0}
              sx={{
                minWidth: 100,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
              >
                {format(new Date(day.date), "EEE, MMM d")}
              </Typography>
              <Typography variant="h4" sx={{ my: 1 }}>
                {getWeatherIcon(day.weatherCode)}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Thermometer size={14} className="text-red-500" />
                <Typography variant="body2" fontWeight="bold">
                  {Math.round(day.maxTemp)}°
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  / {Math.round(day.minTemp)}°
                </Typography>
              </Box>
              {day.precipitationProbability > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mt: 0.5,
                    color: "info.main",
                  }}
                >
                  <CloudRain size={12} />
                  <Typography variant="caption" fontWeight="bold">
                    {day.precipitationProbability}%
                  </Typography>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      </Paper>
    );
  }

  return null;
};
