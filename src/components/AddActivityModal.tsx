import { useState } from "react";
import { X, MapPin, Plus } from "lucide-react";
import { LocationSearch } from "./LocationSearch";
import { Map } from "./Map";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (location: {
    name: string;
    lat: number;
    lng: number;
    address: string;
  }) => void;
}

export const AddActivityModal = ({
  isOpen,
  onClose,
  onAdd,
}: AddActivityModalProps) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const [viewState, setViewState] = useState({
    center: [16.0544, 108.2022] as [number, number],
    zoom: 13,
  });

  if (!isOpen) return null;

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    setViewState({
      center: [lat, lng],
      zoom: 15,
    });
    setSelectedLocation({
      name: name.split(",")[0], // Simple name extraction
      lat,
      lng,
      address: name,
    });
  };

  const handleAdd = () => {
    if (selectedLocation) {
      onAdd(selectedLocation);
      onClose();
      setSelectedLocation(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[600px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Add Activity</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-100 p-4 flex flex-col bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Location
              </label>
              <LocationSearch onLocationSelect={handleLocationSelect} />
            </div>

            {selectedLocation ? (
              <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {selectedLocation.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {selectedLocation.address}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAdd}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add to Itinerary
                </button>
              </div>
            ) : (
              <div className="mt-auto text-center p-6 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">
                  Search for a location to add it to your trip
                </p>
              </div>
            )}
          </div>

          {/* Map Area */}
          <div className="flex-1 relative">
            <Map
              center={viewState.center}
              zoom={viewState.zoom}
              markers={
                selectedLocation
                  ? [
                      {
                        id: "selected",
                        position: [selectedLocation.lat, selectedLocation.lng],
                        title: selectedLocation.name,
                      },
                    ]
                  : []
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
