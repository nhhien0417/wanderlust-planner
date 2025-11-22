import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Trip, TripTask, Activity, PackingItem, Photo } from "../types";
import { getCoordinates, getWeatherForecast } from "../api/weatherApi";
import { photoStorage } from "../utils/photoStorage";
import { supabase } from "../../supabase/supabase";
import { useAuthStore } from "./useAuthStore";

const STORAGE_KEY = "wanderlust-storage";

interface TripState {
  trips: Trip[];
  activeTripId: string | null;
  isLoading: boolean;

  // Actions
  fetchTrips: () => Promise<void>;
  addTrip: (
    trip: Omit<Trip, "id" | "days" | "tasks" | "expenses" | "packingList">
  ) => Promise<void>;
  setActiveTrip: (id: string | null) => void;
  deleteTrip: (id: string) => Promise<void>;

  // Itinerary Actions
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

  // Task Actions
  addTask: (
    tripId: string,
    task: Omit<TripTask, "id" | "subtasks">
  ) => Promise<void>;
  updateTaskStatus: (
    tripId: string,
    taskId: string,
    status: TripTask["status"]
  ) => Promise<void>;
  updateTask: (
    tripId: string,
    taskId: string,
    updates: Partial<Omit<TripTask, "id" | "subtasks">>
  ) => Promise<void>;
  deleteTask: (tripId: string, taskId: string) => Promise<void>;

  // Budget Actions
  addExpense: (
    tripId: string,
    expense: Omit<Trip["expenses"][0], "id">
  ) => Promise<void>;
  removeExpense: (tripId: string, expenseId: string) => Promise<void>;
  updateExpense: (
    tripId: string,
    expenseId: string,
    updates: Partial<Omit<Trip["expenses"][0], "id">>
  ) => Promise<void>;
  setBudget: (tripId: string, amount: number) => Promise<void>;

  // Packing List Actions
  addPackingItem: (
    tripId: string,
    item: Omit<PackingItem, "id" | "checked">
  ) => Promise<void>;
  removePackingItem: (tripId: string, itemId: string) => Promise<void>;
  togglePackingItem: (tripId: string, itemId: string) => Promise<void>;
  generatePackingList: (tripId: string) => Promise<void>;

  // Weather Actions
  fetchTripWeather: (tripId: string) => Promise<void>;

  // Photo Actions
  addPhoto: (tripId: string, photo: Photo) => Promise<void>;
  deletePhoto: (tripId: string, photoId: string) => Promise<void>;
  removePhoto: (tripId: string, photoId: string) => void;
  updatePhoto: (
    tripId: string,
    photoId: string,
    updates: Partial<Omit<Photo, "id">>
  ) => Promise<void>;
  getPhotosByTrip: (tripId: string) => Photo[];
  getPhotosByActivity: (tripId: string, activityId: string) => Photo[];
  getPhotosByDay: (tripId: string, dayId: string) => Photo[];

  // Collaboration Actions
  inviteMember: (tripId: string, email: string) => Promise<void>;
  removeMember: (tripId: string, userId: string) => Promise<void>;
  subscribeToTrip: (tripId: string) => void;
  unsubscribeFromTrip: (tripId: string) => void;

  // Helpers
  updateJsonbColumn: (
    tripId: string,
    column: string,
    data: any
  ) => Promise<void>;
}

const EMPTY_PHOTOS: Photo[] = [];

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

export const useTripStore = create<TripState>((set, get) => ({
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
        budget: 0,
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
      members: [],
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
        tasks: [],
        expenses: [],
        packing_list: [],
        weather: [],
        photos: [],
      });

      if (tripError) {
        console.error("Error creating trip:", tripError);
        return;
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
      if (daysError) console.error("Error creating days:", daysError);

      // Add creator as owner in trip_members
      await supabase.from("trip_members").insert({
        trip_id: newTripId,
        user_id: user.id,
        role: "owner",
      });

      set((state) => ({
        trips: [...state.trips, newTrip],
        activeTripId: newTripId,
      }));
    } else {
      // Local Storage
      set((state) => {
        const newState = {
          trips: [...state.trips, newTrip],
          activeTripId: newTripId,
        };
        saveToLocalStorage(newState);
        return newState;
      });
    }
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

  addActivity: async (tripId, dayId, activityData) => {
    const user = useAuthStore.getState().user;
    const newActivityId = uuidv4();
    const newActivity: Activity = {
      id: newActivityId,
      tripId,
      dayId,
      ...activityData,
    };

    if (user) {
      // Supabase Insert
      await supabase.from("activities").insert({
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
    }

    // Optimistic Update
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        const day = trip.days.find((d) => d.id === dayId);
        if (day) {
          day.activities.push(newActivity);
        }
      }
      if (!user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  removeActivity: async (tripId, dayId, activityId) => {
    const user = useAuthStore.getState().user;
    if (user) {
      await supabase.from("activities").delete().eq("id", activityId);
    }

    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        const day = trip.days.find((d) => d.id === dayId);
        if (day) {
          day.activities = day.activities.filter((a) => a.id !== activityId);
        }
      }
      if (!user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
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

    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        const day = trip.days.find((d) => d.id === dayId);
        if (day) {
          day.activities = newActivities;
        }
      }
      if (!user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  updateJsonbColumn: async (tripId: string, column: string, data: any) => {
    const user = useAuthStore.getState().user;
    if (user) {
      await supabase
        .from("trips")
        .update({ [column]: data })
        .eq("id", tripId);
    }
  },

  addTask: async (tripId, taskData) => {
    const newTask = { ...taskData, id: uuidv4(), subtasks: [] };

    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.tasks.push(newTask);
        get().updateJsonbColumn(tripId, "tasks", trip.tasks);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  updateTaskStatus: async (tripId, taskId, status) => {
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        const task = trip.tasks.find((t) => t.id === taskId);
        if (task) {
          task.status = status;
          get().updateJsonbColumn(tripId, "tasks", trip.tasks);
        }
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  updateTask: async (tripId, taskId, updates) => {
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        const taskIndex = trip.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          trip.tasks[taskIndex] = { ...trip.tasks[taskIndex], ...updates };
          get().updateJsonbColumn(tripId, "tasks", trip.tasks);
        }
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  deleteTask: async (tripId, taskId) => {
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.tasks = trip.tasks.filter((t) => t.id !== taskId);
        get().updateJsonbColumn(tripId, "tasks", trip.tasks);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  addExpense: async (tripId, expense) => {
    const newExpense = { ...expense, id: uuidv4() };
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.expenses.push(newExpense);
        get().updateJsonbColumn(tripId, "expenses", trip.expenses);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  removeExpense: async (tripId, expenseId) => {
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.expenses = trip.expenses.filter((e) => e.id !== expenseId);
        get().updateJsonbColumn(tripId, "expenses", trip.expenses);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  updateExpense: async (tripId, expenseId, updates) => {
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.expenses = trip.expenses.map((e) =>
          e.id === expenseId ? { ...e, ...updates } : e
        );
        get().updateJsonbColumn(tripId, "expenses", trip.expenses);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  setBudget: async (tripId, amount) => {
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.budget = amount;
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  addPackingItem: async (tripId, item) => {
    const newItem = { ...item, id: uuidv4(), checked: false };
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.packingList.push(newItem);
        get().updateJsonbColumn(tripId, "packing_list", trip.packingList);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  removePackingItem: async (tripId, itemId) => {
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.packingList = trip.packingList.filter((i) => i.id !== itemId);
        get().updateJsonbColumn(tripId, "packing_list", trip.packingList);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  togglePackingItem: async (tripId, itemId) => {
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.packingList = trip.packingList.map((i) =>
          i.id === itemId ? { ...i, checked: !i.checked } : i
        );
        get().updateJsonbColumn(tripId, "packing_list", trip.packingList);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  generatePackingList: async (tripId) => {
    set((state) => {
      const tripIndex = state.trips.findIndex((t) => t.id === tripId);
      if (tripIndex === -1) return state;

      const newTrips = [...state.trips];
      const trip = newTrips[tripIndex];

      const itemPools = {
        Clothing: [
          "T-Shirts",
          "Pants/Shorts",
          "Underwear",
          "Socks",
          "Shoes",
          "Sleepwear",
          "Jacket/Hoodie",
          "Swimwear",
          "Formal Wear",
          "Activewear",
        ],
        Toiletries: [
          "Toothbrush",
          "Toothpaste",
          "Shampoo/Conditioner",
          "Body Wash/Soap",
          "Deodorant",
          "Razor/Shaving Kit",
          "Skincare/Lotion",
          "Hairbrush/Comb",
          "Floss",
          "Cotton Swabs",
        ],
        "Health & Wellness": [
          "First Aid Kit",
          "Pain Relievers",
          "Vitamins/Meds",
          "Hand Sanitizer",
          "Sunscreen",
          "Insect Repellent",
          "Motion Sickness Pills",
          "Prescriptions",
        ],
        Electronics: [
          "Phone Charger",
          "Power Bank",
          "Headphones/Earbuds",
          "Travel Adapter",
          "Camera",
          "Laptop/Tablet",
          "Smart Watch Charger",
        ],
        Documents: [
          "Passport/ID",
          "Wallet/Cash/Cards",
          "Travel Insurance",
          "Tickets/Reservations",
          "Visa/Entry Docs",
          "Emergency Contacts",
        ],
        Other: [
          "Reusable Water Bottle",
          "Snacks",
          "Book/E-reader",
          "Travel Pillow",
          "Pen/Notebook",
          "Plastic Bags",
          "Sunglasses",
          "Umbrella",
          "Keys",
        ],
      };

      const pickRandom = (items: string[], min: number, max: number) => {
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        return shuffled.slice(0, count);
      };

      const selectedItems: { name: string; category: string }[] = [];
      Object.entries(itemPools).forEach(([category, items]) => {
        const picked = pickRandom(items, 3, 5);
        picked.forEach((name) => selectedItems.push({ name, category }));
      });

      if (trip.weather) {
        const hasRain = trip.weather.some(
          (d) => d.precipitationProbability > 30 || d.weatherCode >= 51
        );
        const hasSun = trip.weather.some((d) => d.maxTemp > 25);
        const hasCold = trip.weather.some((d) => d.minTemp < 10);

        if (hasRain)
          selectedItems.push(
            { name: "Umbrella", category: "Clothing" },
            { name: "Raincoat/Poncho", category: "Clothing" },
            { name: "Waterproof Shoes", category: "Clothing" }
          );
        if (hasSun)
          selectedItems.push(
            { name: "Hat/Cap", category: "Clothing" },
            { name: "Sunglasses", category: "Clothing" },
            { name: "Swimwear", category: "Clothing" },
            { name: "Beach Towel", category: "Other" }
          );
        if (hasCold)
          selectedItems.push(
            { name: "Heavy Coat", category: "Clothing" },
            { name: "Scarf", category: "Clothing" },
            { name: "Gloves", category: "Clothing" },
            { name: "Thermal Wear", category: "Clothing" }
          );
      }

      const existingNames = new Set(trip.packingList.map((i) => i.name));
      const newItems = selectedItems
        .filter((i) => !existingNames.has(i.name))
        .map((i) => ({
          id: uuidv4(),
          name: i.name,
          category: i.category,
          checked: false,
          isCustom: false,
        }));

      newTrips[tripIndex] = {
        ...newTrips[tripIndex],
        packingList: [...trip.packingList, ...newItems],
      };

      get().updateJsonbColumn(
        tripId,
        "packing_list",
        newTrips[tripIndex].packingList
      );

      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  fetchTripWeather: async (tripId) => {
    const state = get();
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return;

    let lat = 0;
    let lng = 0;

    if (trip.coordinates) {
      lat = trip.coordinates.lat;
      lng = trip.coordinates.lng;
    } else {
      const coords = await getCoordinates(trip.destination);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
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
      set((state) => {
        const newTrips = [...state.trips];
        const tripIndex = newTrips.findIndex((t) => t.id === tripId);
        if (tripIndex !== -1) {
          newTrips[tripIndex].weather = weatherData;
          get().updateJsonbColumn(tripId, "weather", weatherData);
        }
        if (!useAuthStore.getState().user)
          saveToLocalStorage({
            trips: newTrips,
            activeTripId: state.activeTripId,
          });
        return { trips: newTrips };
      });
    }
  },

  addPhoto: async (tripId, photo) => {
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.photos = [...(trip.photos || []), photo];
        get().updateJsonbColumn(tripId, "photos", trip.photos);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  deletePhoto: async (tripId, photoId) => {
    try {
      await photoStorage.deletePhoto(photoId);
    } catch (error) {
      console.error("Failed to delete photo from storage", error);
    }

    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip && trip.photos) {
        trip.photos = trip.photos.filter((p) => p.id !== photoId);
        get().updateJsonbColumn(tripId, "photos", trip.photos);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  removePhoto: (tripId, photoId) => get().deletePhoto(tripId, photoId),

  updatePhoto: async (tripId, photoId, updates) => {
    set((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip && trip.photos) {
        trip.photos = trip.photos.map((p) =>
          p.id === photoId ? { ...p, ...updates } : p
        );
        get().updateJsonbColumn(tripId, "photos", trip.photos);
      }
      if (!useAuthStore.getState().user)
        saveToLocalStorage({
          trips: newTrips,
          activeTripId: state.activeTripId,
        });
      return { trips: newTrips };
    });
  },

  getPhotosByTrip: (tripId) => {
    const trip = get().trips.find((t) => t.id === tripId);
    return trip?.photos ?? EMPTY_PHOTOS;
  },

  getPhotosByActivity: (tripId, activityId) => {
    const photos = get().getPhotosByTrip(tripId);
    return photos.filter((photo) => photo.activityId === activityId);
  },

  getPhotosByDay: (tripId, dayId) => {
    const photos = get().getPhotosByTrip(tripId);
    return photos.filter((photo) => photo.dayId === dayId);
  },

  inviteMember: async (tripId, email) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("Must be logged in to invite members");

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profileError || !profiles) {
      throw new Error("User not found. They must sign up first.");
    }

    const userId = profiles.id;

    const { error: memberError } = await supabase.from("trip_members").insert({
      trip_id: tripId,
      user_id: userId,
      role: "editor",
    });

    if (memberError) {
      if (memberError.code === "23505")
        throw new Error("User is already a member");
      throw memberError;
    }
  },

  removeMember: async (tripId, userId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await supabase
      .from("trip_members")
      .delete()
      .eq("trip_id", tripId)
      .eq("user_id", userId);
  },

  subscribeToTrip: (tripId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    supabase
      .channel(`trip-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          get().fetchTrips();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`,
        },
        () => {
          get().fetchTrips();
        }
      )
      .subscribe();
  },

  unsubscribeFromTrip: (tripId) => {
    supabase.removeChannel(supabase.channel(`trip-${tripId}`));
  },
}));
