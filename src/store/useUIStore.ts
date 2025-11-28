import { create } from "zustand";

interface UIState {
  isCreateTripModalOpen: boolean;
  openCreateTripModal: () => void;
  closeCreateTripModal: () => void;
  sidebarMode: "expanded" | "collapsed" | "hover";
  setSidebarMode: (mode: "expanded" | "collapsed" | "hover") => void;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateTripModalOpen: false,
  openCreateTripModal: () => set({ isCreateTripModalOpen: true }),
  closeCreateTripModal: () => set({ isCreateTripModalOpen: false }),
  sidebarMode: "hover",
  setSidebarMode: (mode) => set({ sidebarMode: mode }),
  isSettingsModalOpen: false,
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
}));
