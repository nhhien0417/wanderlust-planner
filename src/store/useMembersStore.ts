import { create } from "zustand";
import { supabase } from "../../supabase/supabase";
import { useTripsStore } from "./useTripsStore";

interface MembersState {
  inviteMember: (tripId: string, email: string) => Promise<void>;
  removeMember: (tripId: string, userId: string) => Promise<void>;
  subscribeToTrip: (tripId: string) => void;
  unsubscribeFromTrip: (tripId: string) => void;
}

// Store RealtimeChannel subscriptions
const subscriptions = new Map<string, any>();

export const useMembersStore = create<MembersState>(() => ({
  inviteMember: async (tripId, email) => {
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      console.error("User not found");
      return;
    }

    const { error } = await supabase.from("trip_members").insert({
      trip_id: tripId,
      user_id: userData.id,
      role: "editor",
    });

    if (error) {
      console.error("Error inviting member:", error);
    } else {
      // Refresh trips to get updated members
      await useTripsStore.getState().fetchTrips();
    }
  },

  removeMember: async (tripId, userId) => {
    await supabase
      .from("trip_members")
      .delete()
      .eq("trip_id", tripId)
      .eq("user_id", userId);
  },

  subscribeToTrip: (tripId) => {
    if (subscriptions.has(tripId)) return;

    const channel = supabase
      .channel(`trip:${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`,
        },
        () => {
          // Refresh trips when changes detected
          useTripsStore.getState().fetchTrips();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          useTripsStore.getState().fetchTrips();
        }
      )
      .subscribe();

    subscriptions.set(tripId, channel);
  },

  unsubscribeFromTrip: (tripId) => {
    const channel = subscriptions.get(tripId);
    if (channel) {
      supabase.removeChannel(channel);
      subscriptions.delete(tripId);
    }
  },
}));
