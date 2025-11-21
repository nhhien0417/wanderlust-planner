import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Trip, TripTask, Activity, PackingItem, Photo } from "../types";
import { getCoordinates, getWeatherForecast } from "../api/weatherApi";
import { photoStorage } from "../utils/photoStorage";

interface TripState {
  trips: Trip[];
  activeTripId: string | null;

  // Actions
  addTrip: (
    trip: Omit<Trip, "id" | "days" | "tasks" | "expenses" | "packingList">
  ) => void;
  setActiveTrip: (id: string | null) => void;
  deleteTrip: (id: string) => void;

  // Itinerary Actions
  addActivity: (
    tripId: string,
    dayId: string,
    activityData: Omit<Activity, "id" | "tripId" | "dayId">
  ) => void;
  removeActivity: (tripId: string, dayId: string, activityId: string) => void;
  reorderActivities: (
    tripId: string,
    dayId: string,
    newActivities: Activity[]
  ) => void;

  // Task Actions
  addTask: (tripId: string, task: Omit<TripTask, "id" | "subtasks">) => void;
  updateTaskStatus: (
    tripId: string,
    taskId: string,
    status: TripTask["status"]
  ) => void;
  updateTask: (
    tripId: string,
    taskId: string,
    updates: Partial<Omit<TripTask, "id" | "subtasks">>
  ) => void;
  deleteTask: (tripId: string, taskId: string) => void;

  // Budget Actions
  addExpense: (
    tripId: string,
    expense: Omit<Trip["expenses"][0], "id">
  ) => void;
  removeExpense: (tripId: string, expenseId: string) => void;
  updateExpense: (
    tripId: string,
    expenseId: string,
    updates: Partial<Omit<Trip["expenses"][0], "id">>
  ) => void;
  setBudget: (tripId: string, amount: number) => void;

  // Packing List Actions
  addPackingItem: (
    tripId: string,
    item: Omit<PackingItem, "id" | "checked">
  ) => void;
  removePackingItem: (tripId: string, itemId: string) => void;
  togglePackingItem: (tripId: string, itemId: string) => void;
  generatePackingList: (tripId: string) => void;

  // Weather Actions
  fetchTripWeather: (tripId: string) => Promise<void>;

  // Photo Actions
  addPhoto: (tripId: string, photo: Photo) => void;
  deletePhoto: (tripId: string, photoId: string) => Promise<void>;
  removePhoto: (tripId: string, photoId: string) => void;
  updatePhoto: (
    tripId: string,
    photoId: string,
    updates: Partial<Omit<Photo, "id">>
  ) => void;
  getPhotosByTrip: (tripId: string) => Photo[];
  getPhotosByActivity: (tripId: string, activityId: string) => Photo[];
  getPhotosByDay: (tripId: string, dayId: string) => Photo[];
}

const EMPTY_PHOTOS: Photo[] = [];

// Helper to generate days between dates
const generateDays = (start: string, end: string) => {
  const days = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Use yyyy-MM-dd format in local timezone to match weather API
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

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      activeTripId: null,

      addTrip: (tripData) =>
        set((state) => {
          const newTrip: Trip = {
            ...tripData,
            id: uuidv4(),
            days: generateDays(tripData.startDate, tripData.endDate),
            tasks: [],
            expenses: [],
            packingList: [],
            photos: [],
          };
          return {
            trips: [...state.trips, newTrip],
            activeTripId: newTrip.id,
          };
        }),

      setActiveTrip: (id) => set({ activeTripId: id }),

      deleteTrip: (id) =>
        set((state) => ({
          trips: state.trips.filter((t) => t.id !== id),
          activeTripId: state.activeTripId === id ? null : state.activeTripId,
        })),

      addActivity: (tripId, dayId, activityData) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const trip = newTrips[tripIndex];
          const dayIndex = trip.days.findIndex((d) => d.id === dayId);

          if (dayIndex !== -1) {
            trip.days[dayIndex].activities.push({
              id: uuidv4(),
              tripId,
              dayId,
              ...activityData,
            });
          }

          return { trips: newTrips };
        }),

      removeActivity: (tripId, dayId, activityId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const trip = newTrips[tripIndex];
          const dayIndex = trip.days.findIndex((d) => d.id === dayId);

          if (dayIndex !== -1) {
            trip.days[dayIndex].activities = trip.days[
              dayIndex
            ].activities.filter((a) => a.id !== activityId);
          }

          return { trips: newTrips };
        }),

      reorderActivities: (tripId, dayId, newActivities) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const trip = newTrips[tripIndex];
          const dayIndex = trip.days.findIndex((d) => d.id === dayId);

          if (dayIndex !== -1) {
            trip.days[dayIndex].activities = newActivities;
          }

          return { trips: newTrips };
        }),

      addTask: (tripId, taskData) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex].tasks.push({
            ...taskData,
            id: uuidv4(),
            subtasks: [],
          });

          return { trips: newTrips };
        }),

      updateTaskStatus: (tripId, taskId, status) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const task = newTrips[tripIndex].tasks.find((t) => t.id === taskId);
          if (task) {
            task.status = status;
          }

          return { trips: newTrips };
        }),

      updateTask: (tripId, taskId, updates) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const taskIndex = newTrips[tripIndex].tasks.findIndex(
            (t) => t.id === taskId
          );

          if (taskIndex !== -1) {
            newTrips[tripIndex].tasks[taskIndex] = {
              ...newTrips[tripIndex].tasks[taskIndex],
              ...updates,
            };
          }

          return { trips: newTrips };
        }),

      deleteTask: (tripId, taskId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex].tasks = newTrips[tripIndex].tasks.filter(
            (t) => t.id !== taskId
          );

          return { trips: newTrips };
        }),

      addExpense: (tripId, expense) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex] = {
            ...newTrips[tripIndex],
            expenses: [
              ...newTrips[tripIndex].expenses,
              { ...expense, id: uuidv4() },
            ],
          };

          return { trips: newTrips };
        }),

      removeExpense: (tripId, expenseId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex] = {
            ...newTrips[tripIndex],
            expenses: newTrips[tripIndex].expenses.filter(
              (e) => e.id !== expenseId
            ),
          };

          return { trips: newTrips };
        }),

      updateExpense: (tripId, expenseId, updates) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex] = {
            ...newTrips[tripIndex],
            expenses: newTrips[tripIndex].expenses.map((e) =>
              e.id === expenseId ? { ...e, ...updates } : e
            ),
          };

          return { trips: newTrips };
        }),

      setBudget: (tripId, amount) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex] = {
            ...newTrips[tripIndex],
            budget: amount,
          };

          return { trips: newTrips };
        }),

      addPackingItem: (tripId, item) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex] = {
            ...newTrips[tripIndex],
            packingList: [
              ...newTrips[tripIndex].packingList,
              { ...item, id: uuidv4(), checked: false },
            ],
          };

          return { trips: newTrips };
        }),

      removePackingItem: (tripId, itemId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex] = {
            ...newTrips[tripIndex],
            packingList: newTrips[tripIndex].packingList.filter(
              (i) => i.id !== itemId
            ),
          };

          return { trips: newTrips };
        }),

      togglePackingItem: (tripId, itemId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex] = {
            ...newTrips[tripIndex],
            packingList: newTrips[tripIndex].packingList.map((i) =>
              i.id === itemId ? { ...i, checked: !i.checked } : i
            ),
          };

          return { trips: newTrips };
        }),

      generatePackingList: (tripId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const trip = newTrips[tripIndex];

          // Define item pools by category
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

          // Helper to pick random items
          const pickRandom = (items: string[], min: number, max: number) => {
            const shuffled = [...items].sort(() => 0.5 - Math.random());
            const count = Math.floor(Math.random() * (max - min + 1)) + min;
            return shuffled.slice(0, count);
          };

          const selectedItems: { name: string; category: string }[] = [];

          // Pick random items from each category
          Object.entries(itemPools).forEach(([category, items]) => {
            const picked = pickRandom(items, 3, 5); // Pick 3 to 5 items per category
            picked.forEach((name) => selectedItems.push({ name, category }));
          });

          // Weather-based suggestions (Always include relevant ones)
          if (trip.weather) {
            const hasRain = trip.weather.some(
              (d) => d.precipitationProbability > 30 || d.weatherCode >= 51
            );
            const hasSun = trip.weather.some((d) => d.maxTemp > 25);
            const hasCold = trip.weather.some((d) => d.minTemp < 10);

            if (hasRain) {
              selectedItems.push(
                { name: "Umbrella", category: "Clothing" },
                { name: "Raincoat/Poncho", category: "Clothing" },
                { name: "Waterproof Shoes", category: "Clothing" }
              );
            }
            if (hasSun) {
              selectedItems.push(
                { name: "Hat/Cap", category: "Clothing" },
                { name: "Sunglasses", category: "Clothing" },
                { name: "Swimwear", category: "Clothing" },
                { name: "Beach Towel", category: "Other" }
              );
            }
            if (hasCold) {
              selectedItems.push(
                { name: "Heavy Coat", category: "Clothing" },
                { name: "Scarf", category: "Clothing" },
                { name: "Gloves", category: "Clothing" },
                { name: "Thermal Wear", category: "Clothing" }
              );
            }
          }

          // Filter out items that already exist
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

          return { trips: newTrips };
        }),

      fetchTripWeather: async (tripId) => {
        const state = get();
        const trip = state.trips.find((t) => t.id === tripId);
        if (!trip) return;

        let lat = 0;
        let lng = 0;

        // Try to get coordinates from destination string
        const coords = await getCoordinates(trip.destination);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        } else {
          console.error("Could not find coordinates for destination");
          return;
        }

        const weatherData = await getWeatherForecast(
          lat,
          lng,
          trip.startDate,
          trip.endDate
        );

        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex].weather = weatherData;

          return { trips: newTrips };
        });
      },

      addPhoto: (tripId, photo) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const currentPhotos = newTrips[tripIndex].photos ?? [];
          newTrips[tripIndex].photos = [...currentPhotos, photo];

          return { trips: newTrips };
        }),

      deletePhoto: async (tripId, photoId) => {
        try {
          await photoStorage.deletePhoto(photoId);
        } catch (error) {
          console.error("Failed to delete photo from storage", error);
        }

        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          if (newTrips[tripIndex].photos) {
            newTrips[tripIndex].photos = newTrips[tripIndex].photos!.filter(
              (p) => p.id !== photoId
            );
          }

          return { trips: newTrips };
        });
      },

      removePhoto: (tripId, photoId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          if (newTrips[tripIndex].photos) {
            newTrips[tripIndex].photos = newTrips[tripIndex].photos!.filter(
              (p) => p.id !== photoId
            );
          }

          return { trips: newTrips };
        }),

      updatePhoto: (tripId, photoId, updates) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const existingPhotos = newTrips[tripIndex].photos ?? [];
          newTrips[tripIndex].photos = existingPhotos.map((photo) =>
            photo.id === photoId ? { ...photo, ...updates } : photo
          );

          return { trips: newTrips };
        }),

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
    }),
    {
      name: "wanderlust-storage",
      onRehydrateStorage: () => (state) => {
        // Migration: Convert ISO dates to yyyy-MM-dd format in existing trips
        if (state) {
          state.trips = state.trips.map((trip) => ({
            ...trip,
            days: trip.days.map((day) => {
              // Check if date is in ISO format (contains T)
              if (day.date.includes("T")) {
                const d = new Date(day.date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const dayNum = String(d.getDate()).padStart(2, "0");
                return {
                  ...day,
                  date: `${year}-${month}-${dayNum}`,
                };
              }
              return day;
            }),
          }));
        }
      },
    }
  )
);
