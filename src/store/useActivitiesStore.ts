import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Activity } from "../types";
import { supabase } from "../../supabase/supabase";
import { useAuthStore } from "./useAuthStore";
import { useTripsStore } from "./useTripsStore";

interface ActivitiesState {
  addActivity: (
    tripId: string,
    dayId: string,
    activityData: Omit<Activity, "id" | "tripId" | "dayId">
  ) => Promise<void>;
  removeActivity: (
    tripId: string,
    dayId: string,
    activityId: string
  ) => Promise<void>;
  reorderActivities: (
    tripId: string,
    dayId: string,
    newActivities: Activity[]
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

export const useActivitiesStore = create<ActivitiesState>((_set, _get) => ({
  addActivity: async (tripId, dayId, activityData) => {
    const user = useAuthStore.getState().user;
    const newActivityId = uuidv4();
    const newActivity: Activity = {
      id: newActivityId,
      tripId,
      dayId,
      ...activityData,
    };

    // Optimistic Update
    useTripsStore.setState((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        const day = trip.days.find((d) => d.id === dayId);
        if (day) {
          day.activities.push(newActivity);
        }
      }
      if (!user) saveToLocalStorage();
      return { trips: newTrips };
    });

    if (user) {
      try {
        // Supabase Insert
        const { error } = await supabase.from("activities").insert({
          id: newActivityId,
          trip_id: tripId,
          day_id: dayId,
          title: activityData.title,
          description: activityData.description,
          category: activityData.category,
          location_name: activityData.location?.name,
          location_lat: activityData.location?.lat,
          location_lng: activityData.location?.lng,
          start_time: activityData.startTime,
          end_time: activityData.endTime,
          cost: activityData.cost,
          order_index: 999, // Append to end
        });

        if (error) throw error;
      } catch (error) {
        console.error("Error adding activity:", error);
        // Revert Optimistic Update
        useTripsStore.setState((state) => {
          const newTrips = [...state.trips];
          const trip = newTrips.find((t) => t.id === tripId);
          if (trip) {
            const day = trip.days.find((d) => d.id === dayId);
            if (day) {
              day.activities = day.activities.filter(
                (a) => a.id !== newActivityId
              );
            }
          }
          return { trips: newTrips };
        });
        // Ideally show a toast here, but store shouldn't handle UI directly.
        // We could throw, but that might crash the UI if not caught.
        // For now, console error is enough as the revert will show the user it failed.
        alert("Failed to add activity. You might not have permission.");
      }
    }
  },

  removeActivity: async (tripId, dayId, activityId) => {
    const user = useAuthStore.getState().user;
    if (user) {
      await supabase.from("activities").delete().eq("id", activityId);
    }

    useTripsStore.setState((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        const day = trip.days.find((d) => d.id === dayId);
        if (day) {
          day.activities = day.activities.filter((a) => a.id !== activityId);
        }
      }
      if (!user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },

  reorderActivities: async (tripId, dayId, newActivities) => {
    const user = useAuthStore.getState().user;

    if (user) {
      // Update order in Supabase
      const updates = newActivities.map((a, index) => ({
        id: a.id,
        trip_id: tripId,
        day_id: dayId,
        order_index: index,
      }));

      await supabase.from("activities").upsert(updates, { onConflict: "id" });
    }

    useTripsStore.setState((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        const day = trip.days.find((d) => d.id === dayId);
        if (day) {
          day.activities = newActivities;
        }
      }
      if (!user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },
}));
