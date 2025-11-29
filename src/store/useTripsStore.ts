import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Trip } from "../types";
import { supabase } from "../../supabase/supabase";
import { useAuthStore } from "./useAuthStore";

const STORAGE_KEY = "wanderlust-storage";

interface TripsState {
  trips: Trip[];
  activeTripId: string | null;
  isLoading: boolean;

  // Actions
  fetchTrips: () => Promise<void>;
  addTrip: (
    trip: Omit<Trip, "id" | "days" | "tasks" | "expenses" | "packingList">
  ) => Promise<string | undefined>;
  setActiveTrip: (id: string | null) => void;
  deleteTrip: (id: string) => Promise<void>;
  syncLocalTrips: () => Promise<void>;
}

// Helper to generate days between dates
const generateDays = (start: string, end: string) => {
  const days = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    days.push({
      id: uuidv4(),
      date: dateStr,
      activities: [],
    });
  }
  return days;
};

// Local Storage Helpers
const loadFromLocalStorage = (): {
  trips: Trip[];
  activeTripId: string | null;
} => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { trips: [], activeTripId: null };
    const parsed = JSON.parse(stored);
    // Handle Zustand persist format if it exists
    return parsed.state || parsed;
  } catch (e) {
    console.error("Failed to load from local storage", e);
    return { trips: [], activeTripId: null };
  }
};

const saveToLocalStorage = (state: {
  trips: Trip[];
  activeTripId: string | null;
}) => {
  try {
    // Match Zustand persist format for compatibility
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: 0 }));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }
};

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [],
  activeTripId: null,
  isLoading: false,

  fetchTrips: async () => {
    set({ isLoading: true });
    const user = useAuthStore.getState().user;

    if (user) {
      // Fetch from Supabase
      const { data: tripsData, error } = await supabase
        .from("trips")
        .select(
          `
          *,
          days:trip_days(
            *,
            activities(*)
          ),
          members:trip_members(
            user_id,
            role,
            profiles:user_id(email, full_name, avatar_url)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trips:", error);
        set({ isLoading: false });
        return;
      }

      // Transform data to match Trip interface
      const trips: Trip[] = tripsData.map((t: any) => ({
        id: t.id,
        created_by: t.created_by,
        name: t.title,
        destination: t.destination,
        startDate: t.start_date,
        endDate: t.end_date,
        coverImage: t.cover_image,
        budget: t.budget || 0,
        days: t.days
          .map((d: any) => ({
            id: d.id,
            date: d.date,
            activities: d.activities.sort(
              (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
            ),
          }))
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        tasks: t.tasks || [],
        expenses: t.expenses || [],
        packingList: t.packing_list || [],
        weather: t.weather || [],
        weatherLastUpdated: t.weather_last_updated,
        photos: t.photos || [],
        members:
          t.members?.map((m: any) => ({
            user_id: m.user_id,
            trip_id: t.id,
            role: m.role,
            email: m.profiles?.email,
            full_name: m.profiles?.full_name,
            avatar_url: m.profiles?.avatar_url,
          })) || [],
      }));

      set({ trips, isLoading: false });
    } else {
      // Load from Local Storage
      const localState = loadFromLocalStorage();
      set({ ...localState, isLoading: false });
    }
  },

  addTrip: async (tripData) => {
    const user = useAuthStore.getState().user;
    const days = generateDays(tripData.startDate, tripData.endDate);
    const newTripId = uuidv4();

    const newTrip: Trip = {
      ...tripData,
      id: newTripId,
      days,
      tasks: [],
      expenses: [],
      packingList: [],
      photos: [],
      members: user
        ? [
            {
              user_id: user.id,
              trip_id: newTripId,
              role: "owner",
              email: user.email,
              full_name: user.user_metadata?.full_name,
              avatar_url: user.user_metadata?.avatar_url,
            },
          ]
        : [],
    };

    if (user) {
      // Supabase Insert
      const { error: tripError } = await supabase.from("trips").insert({
        id: newTripId,
        created_by: user.id,
        title: tripData.name,
        destination: tripData.destination,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        cover_image: tripData.coverImage,
        budget: tripData.budget || 0,
        tasks: [],
        expenses: [],
        packing_list: [],
        weather: [],
        photos: [],
      });

      if (tripError) {
        console.error("Error creating trip:", tripError);
        return undefined;
      }

      // Insert Days
      const dayRows = days.map((d) => ({
        id: d.id,
        trip_id: newTripId,
        date: d.date,
      }));

      const { error: daysError } = await supabase
        .from("trip_days")
        .insert(dayRows);
      if (daysError) {
        console.error("Error creating days:", daysError);
        // Optional: Rollback trip?
      }

      // Add creator as owner in trip_members
      const { error: memberError } = await supabase
        .from("trip_members")
        .insert({
          trip_id: newTripId,
          user_id: user.id,
          role: "owner",
        });
      if (memberError) {
        console.error("Error adding member:", memberError);
      }

      set((state) => ({
        trips: [newTrip, ...state.trips],
        activeTripId: newTripId,
      }));
    } else {
      try {
        set((state) => {
          const newState = {
            trips: [newTrip, ...state.trips],
            activeTripId: newTripId,
          };
          saveToLocalStorage(newState);
          return newState;
        });
      } catch (error) {
        console.error("Error saving trip to local storage:", error);
        return undefined;
      }
    }

    return newTripId;
  },

  setActiveTrip: (id) => {
    set({ activeTripId: id });
    const user = useAuthStore.getState().user;
    if (!user) {
      saveToLocalStorage({ trips: get().trips, activeTripId: id });
    }
  },

  deleteTrip: async (id) => {
    const user = useAuthStore.getState().user;
    if (user) {
      await supabase.from("trips").delete().eq("id", id);
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== id),
        activeTripId: state.activeTripId === id ? null : state.activeTripId,
      }));
    } else {
      set((state) => {
        const newState = {
          trips: state.trips.filter((t) => t.id !== id),
          activeTripId: state.activeTripId === id ? null : state.activeTripId,
        };
        saveToLocalStorage(newState);
        return newState;
      });
    }
  },

  syncLocalTrips: async () => {
    const localState = loadFromLocalStorage();
    if (localState.trips.length === 0) return;

    const user = useAuthStore.getState().user;
    if (!user) return;

    let allSuccess = true;

    for (const trip of localState.trips) {
      // Check if trip already exists to avoid duplicates or errors
      const { data: existing } = await supabase
        .from("trips")
        .select("id")
        .eq("id", trip.id)
        .single();

      if (existing) continue;

      // Insert Trip
      const { error: tripError } = await supabase.from("trips").insert({
        id: trip.id,
        created_by: user.id,
        title: trip.name,
        destination: trip.destination,
        start_date: trip.startDate,
        end_date: trip.endDate,
        cover_image: trip.coverImage,
        budget: trip.budget || 0,
        tasks: trip.tasks || [],
        expenses: trip.expenses || [],
        packing_list: trip.packingList || [],
        weather: trip.weather || [],
        photos: trip.photos || [],
      });

      if (tripError) {
        console.error("Error syncing trip:", tripError);
        allSuccess = false;
        continue;
      }

      // Insert Days
      const dayRows = trip.days.map((d) => ({
        id: d.id,
        trip_id: trip.id,
        date: d.date,
      }));

      if (dayRows.length > 0) {
        const { error: daysError } = await supabase
          .from("trip_days")
          .insert(dayRows);
        if (daysError) console.error("Error syncing days:", daysError);
      }

      // Insert Activities
      const allActivities = trip.days.flatMap((d) =>
        d.activities.map((a, index) => ({
          id: a.id,
          trip_id: trip.id,
          day_id: d.id,
          title: a.title,
          description: a.description,
          category: a.category,
          location_name: a.location?.name,
          location_lat: a.location?.lat,
          location_lng: a.location?.lng,
          start_time: a.startTime,
          end_time: a.endTime,
          cost: a.cost,
          order_index: index,
        }))
      );

      if (allActivities.length > 0) {
        const { error: activitiesError } = await supabase
          .from("activities")
          .insert(allActivities);
        if (activitiesError)
          console.error("Error syncing activities:", activitiesError);
      }

      // Insert Member (Owner)
      await supabase.from("trip_members").insert({
        trip_id: trip.id,
        user_id: user.id,
        role: "owner",
      });
    }

    // Clear Local Storage only if all synced successfully
    if (allSuccess) {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Refresh trips
    get().fetchTrips();
  },
}));
