// Re-export all specialized stores for backward compatibility
export { useTripsStore } from "./useTripsStore";
export { useActivitiesStore } from "./useActivitiesStore";
export { useTasksStore } from "./useTasksStore";
export { useBudgetStore } from "./useBudgetStore";
export { usePackingStore } from "./usePackingStore";
export { usePhotosStore } from "./usePhotosStore";
export { useWeatherStore } from "./useWeatherStore";
export { useMembersStore } from "./useMembersStore";

// Export a combined hook for backward compatibility
// Components using useTripStore will need to be updated to use specific stores
import { useTripsStore } from "./useTripsStore";
export { useTripsStore as useTripStore };
