import {
  Map,
  Layout,
  Calendar,
  Settings,
  PlusCircle,
} from "lucide-react";
import { useTripStore } from "../store/useTripStore";
import { clsx } from "clsx";

export const Sidebar = () => {
  const { activeTripId, setActiveTrip, trips } = useTripStore();

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex items-center gap-2">
        <Map className="w-8 h-8 text-blue-600" />
        <span className="text-xl font-bold text-gray-900">Wanderlust</span>
      </div>

      <div className="flex-1 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">
          Menu
        </div>

        <button
          onClick={() => setActiveTrip(null)}
          className={clsx(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            !activeTripId
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Layout className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </button>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
          My Trips
        </div>

        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => setActiveTrip(trip.id)}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              activeTripId === trip.id
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium truncate">{trip.name}</span>
          </button>
        ))}

        <button
          onClick={() => {
            /* Trigger Create Modal */
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-dashed border-gray-300 hover:border-blue-300 mt-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-medium">New Trip</span>
        </button>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};
