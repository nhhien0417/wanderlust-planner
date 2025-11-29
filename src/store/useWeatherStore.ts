import { create } from "zustand";
import { getCoordinates, getWeatherForecast } from "../api/weatherApi";
import { useAuthStore } from "./useAuthStore";
import { useTripsStore } from "./useTripsStore";
import { supabase } from "../../supabase/supabase";

interface WeatherState {
  fetchTripWeather: (tripId: string) => Promise<void>;
  updateJsonbColumn: (
    tripId: string,
    column: string,
    data: any
  ) => Promise<void>;
}

const saveToLocalStorage = () => {
  const { trips, activeTripId } = useTripsStore.getState();
  try {
    localStorage.setItem(
      "wanderlust-storage",
      JSON.stringify({ state: { trips, activeTripId }, version: 0 })
    );
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }
};

export const useWeatherStore = create<WeatherState>((_set, get) => ({
  updateJsonbColumn: async (tripId: string, column: string, data: any) => {
    const user = useAuthStore.getState().user;
    if (user) {
      try {
        const { error } = await supabase
          .from("trips")
          .update({ [column]: data })
          .eq("id", tripId);

        if (error) throw error;
      } catch (error) {
        console.error(`Error updating ${column}:`, error);
      }
    }
  },

  fetchTripWeather: async (tripId) => {
    const trip = useTripsStore.getState().trips.find((t) => t.id === tripId);
    if (!trip) return;

    const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    const now = new Date().getTime();
    const lastUpdated = trip.weatherLastUpdated
      ? new Date(trip.weatherLastUpdated).getTime()
      : 0;

    if (
      trip.weather &&
      trip.weather.length > 0 &&
      now - lastUpdated < CACHE_DURATION
    ) {
      console.log("Weather data is fresh, skipping fetch.");
      return;
    }

    let lat = 0;
    let lng = 0;
    let coordinatesUpdated = false;

    if (trip.coordinates) {
      lat = trip.coordinates.lat;
      lng = trip.coordinates.lng;
    } else {
      const coords = await getCoordinates(trip.destination);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
        coordinatesUpdated = true;
      } else {
        return;
      }
    }

    const weatherData = await getWeatherForecast(
      lat,
      lng,
      trip.startDate,
      trip.endDate
    );

    if (weatherData && weatherData.length > 0) {
      useTripsStore.setState((state) => {
        const newTrips = [...state.trips];
        const tripIndex = newTrips.findIndex((t) => t.id === tripId);
        if (tripIndex !== -1) {
          newTrips[tripIndex].weather = weatherData;
          newTrips[tripIndex].weatherLastUpdated = new Date().toISOString();

          if (coordinatesUpdated) {
            newTrips[tripIndex].coordinates = { lat, lng };
          }

          // Persist to Supabase
          get().updateJsonbColumn(tripId, "weather", weatherData);
          if (coordinatesUpdated) {
            get().updateJsonbColumn(tripId, "coordinates", { lat, lng });
          }
        }
        if (!useAuthStore.getState().user) saveToLocalStorage();
        return { trips: newTrips };
      });

      get().updateJsonbColumn(
        tripId,
        "weather_last_updated",
        new Date().toISOString()
      );
    }
  },
}));
