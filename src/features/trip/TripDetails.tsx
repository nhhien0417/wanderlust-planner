import { useTripStore } from "../../store/useTripStore";
import { Calendar, MapPin, DollarSign, Clock } from "lucide-react";
import { format, eachDayOfInterval, parseISO } from "date-fns";

interface TripDetailsProps {
  tripId: string;
}

export const TripDetails = ({ tripId }: TripDetailsProps) => {
  const trip = useTripStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );

  if (!trip) {
    return <div>Trip not found</div>;
  }

  const days = eachDayOfInterval({
    start: parseISO(trip.startDate),
    end: parseISO(trip.endDate),
  });

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-64 shrink-0">
        <img
          src={
            trip.coverImage ||
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"
          }
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">{trip.name}</h1>
            <div className="flex items-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {trip.destination}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(parseISO(trip.startDate), "MMM d")} -{" "}
                {format(parseISO(trip.endDate), "MMM d, yyyy")}
              </div>
              {trip.budget > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Budget: ${trip.budget.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-8">
            {days.map((day, index) => (
              <div key={day.toISOString()} className="flex gap-6">
                {/* Day Indicator */}
                <div className="shrink-0 w-24 text-center pt-2">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Day {index + 1}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {format(day, "EEE")}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(day, "MMM d")}
                  </div>
                </div>

                {/* Day Content */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Activities</h3>
                    <button className="text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      + Add Activity
                    </button>
                  </div>

                  {/* Empty State for Day */}
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                    <Clock className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No activities planned yet</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
