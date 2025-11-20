import { useState } from "react";
import { Map } from "../../components/Map";
import { LocationSearch } from "../../components/LocationSearch";

interface TripMapProps {
  tripId: string;
}

export const TripMap = ({ tripId }: TripMapProps) => {
  const [viewState, setViewState] = useState({
    center: [16.0544, 108.2022] as [number, number],
    zoom: 13,
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setViewState({
      center: [lat, lng],
      zoom: 13,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Trip Map</h1>
          <p className="text-sm text-gray-500">ID: {tripId}</p>
        </div>
        <LocationSearch onLocationSelect={handleLocationSelect} />
      </div>
      <div className="flex-1 relative">
        <Map center={viewState.center} zoom={viewState.zoom} />
      </div>
    </div>
  );
};
