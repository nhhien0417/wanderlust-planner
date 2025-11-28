import { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { useTripsStore } from "../../store/useTripsStore";
import { useWeatherStore } from "../../store/useWeatherStore";
import { WeatherHeader } from "./components/weather/WeatherHeader";
import { CurrentWeather } from "./components/weather/CurrentWeather";
import { DailyForecast } from "./components/weather/DailyForecast";
import { WeatherError } from "./components/weather/WeatherError";

interface TripWeatherProps {
  tripId: string;
}

export const TripWeather = ({ tripId }: TripWeatherProps) => {
  const trip = useTripsStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const { fetchTripWeather } = useWeatherStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
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

  if (hasAttemptedFetch && (!trip.weather || trip.weather.length === 0)) {
    return (
      <WeatherError destination={trip.destination} onRetry={handleRetry} />
    );
  }

  if (trip.weather && trip.weather.length > 0) {
    const todayWeather = trip.weather[0];

    return (
      <Container maxWidth="lg">
        <Box sx={{ pb: 4 }}>
          <WeatherHeader
            destination={trip.destination}
            startDate={trip.startDate}
            endDate={trip.endDate}
            onRefresh={handleRetry}
          />

          <CurrentWeather weather={todayWeather} />

          <DailyForecast forecast={trip.weather} />
        </Box>
      </Container>
    );
  }

  return null;
};
