import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { PackingItem } from "../types";
import { supabase } from "../../supabase/supabase";
import { useAuthStore } from "./useAuthStore";
import { useTripsStore } from "./useTripsStore";

interface PackingState {
  addPackingItem: (
    tripId: string,
    item: Omit<PackingItem, "id" | "checked">
  ) => Promise<void>;
  removePackingItem: (tripId: string, itemId: string) => Promise<void>;
  togglePackingItem: (tripId: string, itemId: string) => Promise<void>;
  generatePackingList: (tripId: string) => Promise<void>;
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

export const usePackingStore = create<PackingState>((_set, get) => ({
  updateJsonbColumn: async (tripId: string, column: string, data: any) => {
    const user = useAuthStore.getState().user;
    if (user) {
      await supabase
        .from("trips")
        .update({ [column]: data })
        .eq("id", tripId);
    }
  },

  addPackingItem: async (tripId, item) => {
    const newItem = { ...item, id: uuidv4(), checked: false };
    useTripsStore.setState((state) => {
      const newTrips = state.trips.map((t) => {
        if (t.id === tripId) {
          const newPackingList = [...(t.packingList || []), newItem];
          get().updateJsonbColumn(tripId, "packing_list", newPackingList);
          return { ...t, packingList: newPackingList };
        }
        return t;
      });

      if (!useAuthStore.getState().user) {
        try {
          localStorage.setItem(
            "wanderlust-storage",
            JSON.stringify({
              state: { trips: newTrips, activeTripId: state.activeTripId },
              version: 0,
            })
          );
        } catch (e) {
          console.error("Failed to save to local storage", e);
        }
      }
      return { trips: newTrips };
    });
  },

  removePackingItem: async (tripId, itemId) => {
    useTripsStore.setState((state) => {
      const newTrips = state.trips.map((t) => {
        if (t.id === tripId) {
          const newPackingList = (t.packingList || []).filter(
            (i) => i.id !== itemId
          );
          get().updateJsonbColumn(tripId, "packing_list", newPackingList);
          return { ...t, packingList: newPackingList };
        }
        return t;
      });

      if (!useAuthStore.getState().user) {
        try {
          localStorage.setItem(
            "wanderlust-storage",
            JSON.stringify({
              state: { trips: newTrips, activeTripId: state.activeTripId },
              version: 0,
            })
          );
        } catch (e) {
          console.error("Failed to save to local storage", e);
        }
      }
      return { trips: newTrips };
    });
  },

  togglePackingItem: async (tripId, itemId) => {
    useTripsStore.setState((state) => {
      const newTrips = state.trips.map((t) => {
        if (t.id === tripId) {
          const newPackingList = (t.packingList || []).map((i) =>
            i.id === itemId ? { ...i, checked: !i.checked } : i
          );
          get().updateJsonbColumn(tripId, "packing_list", newPackingList);
          return { ...t, packingList: newPackingList };
        }
        return t;
      });

      if (!useAuthStore.getState().user) {
        try {
          localStorage.setItem(
            "wanderlust-storage",
            JSON.stringify({
              state: { trips: newTrips, activeTripId: state.activeTripId },
              version: 0,
            })
          );
        } catch (e) {
          console.error("Failed to save to local storage", e);
        }
      }
      return { trips: newTrips };
    });
  },

  generatePackingList: async (tripId) => {
    useTripsStore.setState((state) => {
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
        ],
        Toiletries: [
          "Toothbrush",
          "Toothpaste",
          "Shampoo",
          "Deodorant",
          "Skincare",
        ],
        "Health & Wellness": ["First Aid Kit", "Sunscreen", "Medications"],
        Electronics: [
          "Phone Charger",
          "Power Bank",
          "Headphones",
          "Travel Adapter",
        ],
        Documents: [
          "Passport/ID",
          "Wallet/Cash",
          "Travel Insurance",
          "Tickets",
        ],
        Other: ["Water Bottle", "Snacks", "Sunglasses", "Umbrella"],
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
          (d) => d.precipitationProbability > 30
        );
        const hasSun = trip.weather.some((d) => d.maxTemp > 25);
        const hasCold = trip.weather.some((d) => d.minTemp < 10);

        if (hasRain)
          selectedItems.push({ name: "Raincoat", category: "Clothing" });
        if (hasSun) selectedItems.push({ name: "Hat", category: "Clothing" });
        if (hasCold)
          selectedItems.push({ name: "Heavy Coat", category: "Clothing" });
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
      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },
}));
