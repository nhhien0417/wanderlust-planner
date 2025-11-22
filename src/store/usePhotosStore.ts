import { create } from "zustand";
import type { Photo } from "../types";
import { photoStorage } from "../utils/photoStorage";
import { useAuthStore } from "./useAuthStore";
import { useTripsStore } from "./useTripsStore";
import { supabase } from "../../supabase/supabase";

interface PhotosState {
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

export const usePhotosStore = create<PhotosState>((_set, get) => ({
  updateJsonbColumn: async (tripId: string, column: string, data: any) => {
    const user = useAuthStore.getState().user;
    if (user) {
      await supabase
        .from("trips")
        .update({ [column]: data })
        .eq("id", tripId);
    }
  },

  addPhoto: async (tripId, photo) => {
    useTripsStore.setState((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip) {
        trip.photos = [...(trip.photos || []), photo];
        get().updateJsonbColumn(tripId, "photos", trip.photos);
      }
      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },

  deletePhoto: async (tripId, photoId) => {
    try {
      await photoStorage.deletePhoto(photoId);
    } catch (error) {
      console.error("Failed to delete photo from storage", error);
    }

    useTripsStore.setState((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip && trip.photos) {
        trip.photos = trip.photos.filter((p) => p.id !== photoId);
        get().updateJsonbColumn(tripId, "photos", trip.photos);
      }
      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },

  removePhoto: (tripId, photoId) => get().deletePhoto(tripId, photoId),

  updatePhoto: async (tripId, photoId, updates) => {
    useTripsStore.setState((state) => {
      const newTrips = [...state.trips];
      const trip = newTrips.find((t) => t.id === tripId);
      if (trip && trip.photos) {
        trip.photos = trip.photos.map((p) =>
          p.id === photoId ? { ...p, ...updates } : p
        );
        get().updateJsonbColumn(tripId, "photos", trip.photos);
      }
      if (!useAuthStore.getState().user) saveToLocalStorage();
      return { trips: newTrips };
    });
  },

  getPhotosByTrip: (tripId) => {
    const trip = useTripsStore.getState().trips.find((t) => t.id === tripId);
    return trip?.photos || [];
  },

  getPhotosByActivity: (tripId, activityId) => {
    const trip = useTripsStore.getState().trips.find((t) => t.id === tripId);
    return trip?.photos?.filter((p) => p.activityId === activityId) || [];
  },

  getPhotosByDay: (tripId, dayId) => {
    const trip = useTripsStore.getState().trips.find((t) => t.id === tripId);
    return trip?.photos?.filter((p) => p.dayId === dayId) || [];
  },
}));
