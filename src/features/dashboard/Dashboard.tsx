import { useTripStore } from "../../store/useTripStore";
import { Plus, Calendar, MapPin } from "lucide-react";
import { useState } from "react";
import { CreateTripModal } from "../../components/CreateTripModal";

export const Dashboard = () => {
  const { trips, setActiveTrip } = useTripStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-500 mt-1">
            Ready to plan your next adventure?
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Create New Trip
        </button>
      </header>

      {trips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No trips planned yet
          </h3>
          <p className="text-gray-500 mt-2 mb-6">
            Start by creating your first trip itinerary.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 font-medium hover:underline"
          >
            Create a trip now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => setActiveTrip(trip.id)}
              className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={
                    trip.coverImage ||
                    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{trip.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-200 mt-1">
                    <MapPin className="w-4 h-4" />
                    {trip.destination}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                  <Calendar className="w-4 h-4" />
                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {trip.days.length} Days • {trip.tasks.length} Tasks
                  </div>
                  <button className="text-blue-600 font-medium text-sm hover:bg-blue-50 px-3 py-1 rounded-md transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
