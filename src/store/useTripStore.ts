import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Trip, TripTask, Activity, Location, PackingItem } from "../types";
import { getCoordinates, getWeatherForecast } from "../api/weatherApi";

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
  addActivity: (tripId: string, dayId: string, location: Location) => void;
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
}

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

      addActivity: (tripId, dayId, location) =>
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
              location,
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
          newTrips[tripIndex].expenses.push({
            ...expense,
            id: uuidv4(),
          });

          return { trips: newTrips };
        }),

      removeExpense: (tripId, expenseId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex].expenses = newTrips[tripIndex].expenses.filter(
            (e) => e.id !== expenseId
          );

          return { trips: newTrips };
        }),

      updateExpense: (tripId, expenseId, updates) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const expenseIndex = newTrips[tripIndex].expenses.findIndex(
            (e) => e.id === expenseId
          );

          if (expenseIndex !== -1) {
            newTrips[tripIndex].expenses[expenseIndex] = {
              ...newTrips[tripIndex].expenses[expenseIndex],
              ...updates,
            };
          }

          return { trips: newTrips };
        }),

      setBudget: (tripId, amount) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex].budget = amount;

          return { trips: newTrips };
        }),

      addPackingItem: (tripId, item) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex].packingList.push({
            ...item,
            id: uuidv4(),
            checked: false,
          });

          return { trips: newTrips };
        }),

      removePackingItem: (tripId, itemId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          newTrips[tripIndex].packingList = newTrips[
            tripIndex
          ].packingList.filter((i) => i.id !== itemId);

          return { trips: newTrips };
        }),

      togglePackingItem: (tripId, itemId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const item = newTrips[tripIndex].packingList.find(
            (i) => i.id === itemId
          );
          if (item) {
            item.checked = !item.checked;
          }

          return { trips: newTrips };
        }),

      generatePackingList: (tripId) =>
        set((state) => {
          const tripIndex = state.trips.findIndex((t) => t.id === tripId);
          if (tripIndex === -1) return state;

          const newTrips = [...state.trips];
          const trip = newTrips[tripIndex];

          // Basic default items
          const defaultItems = [
            { name: "T-Shirts", category: "Clothing" },
            { name: "Pants/Shorts", category: "Clothing" },
            { name: "Underwear", category: "Clothing" },
            { name: "Socks", category: "Clothing" },
            { name: "Shoes", category: "Clothing" },
            { name: "Toothbrush", category: "Toiletries" },
            { name: "Toothpaste", category: "Toiletries" },
            { name: "Shampoo", category: "Toiletries" },
            { name: "Deodorant", category: "Toiletries" },
            { name: "Phone Charger", category: "Electronics" },
            { name: "Power Bank", category: "Electronics" },
            { name: "Passport/ID", category: "Documents" },
            { name: "Wallet", category: "Documents" },
          ];

          // Weather-based suggestions
          if (trip.weather) {
            const hasRain = trip.weather.some(
              (d) => d.precipitationProbability > 30 || d.weatherCode >= 51
            );
            const hasSun = trip.weather.some((d) => d.maxTemp > 25);
            const hasCold = trip.weather.some((d) => d.minTemp < 10);

            if (hasRain) {
              defaultItems.push(
                { name: "Umbrella", category: "Weather Gear" },
                { name: "Raincoat", category: "Weather Gear" },
                { name: "Waterproof Shoes", category: "Weather Gear" }
              );
            }
            if (hasSun) {
              defaultItems.push(
                { name: "Sunscreen", category: "Toiletries" },
                { name: "Hat", category: "Clothing" },
                { name: "Sunglasses", category: "Accessories" }
              );
            }
            if (hasCold) {
              defaultItems.push(
                { name: "Jacket/Coat", category: "Clothing" },
                { name: "Scarf", category: "Clothing" },
                { name: "Gloves", category: "Clothing" }
              );
            }
          }

          // Filter out items that already exist
          const existingNames = new Set(trip.packingList.map((i) => i.name));
          const newItems = defaultItems
            .filter((i) => !existingNames.has(i.name))
            .map((i) => ({
              id: uuidv4(),
              name: i.name,
              category: i.category,
              checked: false,
              isCustom: false,
            }));

          newTrips[tripIndex].packingList = [...trip.packingList, ...newItems];

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
