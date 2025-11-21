import { create } from "zustand";

interface UIState {
  isCreateTripModalOpen: boolean;
  openCreateTripModal: () => void;
  closeCreateTripModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateTripModalOpen: false,
  openCreateTripModal: () => set({ isCreateTripModalOpen: true }),
  closeCreateTripModal: () => set({ isCreateTripModalOpen: false }),
}));
