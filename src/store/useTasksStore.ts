import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { TripTask } from "../types";
import { supabase } from "../../supabase/supabase";
import { useAuthStore } from "./useAuthStore";
import { useTripsStore } from "./useTripsStore";

interface TasksState {
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

export const useTasksStore = create<TasksState>((_set, get) => ({
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

    useTripsStore.setState((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.tasks.push(newTask);
        get().updateJsonbColumn(tripId, "tasks", trip.tasks);
      }
      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },

  updateTaskStatus: async (tripId, taskId, status) => {
    useTripsStore.setState((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        const task = trip.tasks.find((t) => t.id === taskId);
        if (task) {
          task.status = status;
          get().updateJsonbColumn(tripId, "tasks", trip.tasks);
        }
      }
      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },

  updateTask: async (tripId, taskId, updates) => {
    useTripsStore.setState((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        const taskIndex = trip.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          trip.tasks[taskIndex] = { ...trip.tasks[taskIndex], ...updates };
          get().updateJsonbColumn(tripId, "tasks", trip.tasks);
        }
      }
      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },

  deleteTask: async (tripId, taskId) => {
    useTripsStore.setState((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.tasks = trip.tasks.filter((t) => t.id !== taskId);
        get().updateJsonbColumn(tripId, "tasks", trip.tasks);
      }
      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },
}));
