import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Trip } from "../types";
import { supabase } from "../../supabase/supabase";
import { useAuthStore } from "./useAuthStore";
import { useTripsStore } from "./useTripsStore";

interface BudgetState {
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

export const useBudgetStore = create<BudgetState>((_set, get) => ({
  updateJsonbColumn: async (tripId: string, column: string, data: any) => {
    const user = useAuthStore.getState().user;
    if (user) {
      await supabase
        .from("trips")
        .update({ [column]: data })
        .eq("id", tripId);
    }
  },

  addExpense: async (tripId, expense) => {
    const newExpense = { ...expense, id: uuidv4() };
    useTripsStore.setState((state) => {
      const newTrips = state.trips.map((t) => {
        if (t.id === tripId) {
          const updatedTrip = {
            ...t,
            expenses: [...t.expenses, newExpense],
          };
          get().updateJsonbColumn(tripId, "expenses", updatedTrip.expenses);
          return updatedTrip;
        }
        return t;
      });

      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },

  removeExpense: async (tripId, expenseId) => {
    useTripsStore.setState((state) => {
      const newTrips = state.trips.map((t) => {
        if (t.id === tripId) {
          const updatedTrip = {
            ...t,
            expenses: t.expenses.filter((e) => e.id !== expenseId),
          };
          get().updateJsonbColumn(tripId, "expenses", updatedTrip.expenses);
          return updatedTrip;
        }
        return t;
      });

      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },

  updateExpense: async (tripId, expenseId, updates) => {
    useTripsStore.setState((state) => {
      const newTrips = state.trips.map((t) => {
        if (t.id === tripId) {
          const updatedTrip = {
            ...t,
            expenses: t.expenses.map((e) =>
              e.id === expenseId ? { ...e, ...updates } : e
            ),
          };
          get().updateJsonbColumn(tripId, "expenses", updatedTrip.expenses);
          return updatedTrip;
        }
        return t;
      });

      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },

  setBudget: async (tripId, amount) => {
    useTripsStore.setState((state) => {
      const newTrips = state.trips.map((t) => {
        if (t.id === tripId) {
          const updatedTrip = { ...t, budget: amount };
          get().updateJsonbColumn(tripId, "budget", amount);
          return updatedTrip;
        }
        return t;
      });

      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },
}));
