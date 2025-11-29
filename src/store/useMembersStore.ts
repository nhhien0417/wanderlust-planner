import { create } from "zustand";
import { supabase } from "../../supabase/supabase";
import { useTripsStore } from "./useTripsStore";

interface MembersState {
  inviteMember: (tripId: string, email: string, role?: string) => Promise<void>;
  removeMember: (tripId: string, userId: string) => Promise<void>;
  updateMemberRole: (
    tripId: string,
    userId: string,
    role: string
  ) => Promise<void>;
  leaveTrip: (tripId: string) => Promise<void>;
  subscribeToTrip: (tripId: string) => void;
  unsubscribeFromTrip: (tripId: string) => void;
  createInvite: (tripId: string, role?: string) => Promise<string>;
}

// Store RealtimeChannel subscriptions
const subscriptions = new Map<string, any>();

export const useMembersStore = create<MembersState>(() => ({
  inviteMember: async (tripId, email, role = "editor") => {
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      throw new Error("User not found. Please ensure they have signed up.");
    }

    const { error } = await supabase.from("trip_members").insert({
      trip_id: tripId,
      user_id: userData.id,
      role,
    });

    if (error) throw error;
    await useTripsStore.getState().fetchTrips();
  },

  removeMember: async (tripId, userId) => {
    const { error } = await supabase
      .from("trip_members")
      .delete()
      .eq("trip_id", tripId)
      .eq("user_id", userId);

    if (error) throw error;
    await useTripsStore.getState().fetchTrips();
  },

  updateMemberRole: async (tripId, userId, role) => {
    const { error } = await supabase
      .from("trip_members")
      .update({ role })
      .eq("trip_id", tripId)
      .eq("user_id", userId);

    if (error) throw error;
    await useTripsStore.getState().fetchTrips();
  },

  leaveTrip: async (tripId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("trip_members")
      .delete()
      .eq("trip_id", tripId)
      .eq("user_id", user.id);

    if (error) throw error;

    useTripsStore.setState((state) => ({
      trips: state.trips.filter((t) => t.id !== tripId),
    }));
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_members",
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
  createInvite: async (tripId: string, role: string = "editor") => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("trip_invites")
      .insert({
        trip_id: tripId,
        created_by: user.id,
        role,
      })
      .select("token")
      .single();

    if (error) throw error;
    return data.token;
  },
}));
