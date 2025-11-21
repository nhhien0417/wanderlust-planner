import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trip, TripTask, Activity, Location } from "../types";
import { v4 as uuidv4 } from "uuid";

interface TripState {
  trips: Trip[];
  activeTripId: string | null;

  // Actions
  addTrip: (trip: Omit<Trip, "id" | "days" | "tasks" | "expenses">) => void;
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
}

// Helper to generate days between dates
const generateDays = (start: string, end: string) => {
  const days = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push({
      id: uuidv4(),
      date: new Date(d).toISOString(),
      activities: [],
    });
  }
  return days;
};

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "wanderlust-storage",
    }
  )
);
