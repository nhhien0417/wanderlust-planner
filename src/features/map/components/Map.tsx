import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
  }>;
  onLocationSelect?: (lat: number, lng: number) => void;
  onRightClick?: (lat: number, lng: number) => void;
  onMarkerRemove?: (markerId: string) => void;
}

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapEvents = ({
  onLocationSelect,
  onRightClick,
}: {
  onLocationSelect?: (lat: number, lng: number) => void;
  onRightClick?: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onLocationSelect?.(e.latlng.lat, e.latlng.lng);
    },
    contextmenu(e: L.LeafletMouseEvent) {
      e.originalEvent.preventDefault();
      onRightClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const Map = ({
  center = [16.0544, 108.2022],
  zoom = 13,
  markers = [],
  onLocationSelect,
  onRightClick,
  onMarkerRemove,
}: MapProps) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        borderRadius: "12px",
        zIndex: 0,
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      <MapEvents
        onLocationSelect={onLocationSelect}
        onRightClick={onRightClick}
      />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          eventHandlers={{
            contextmenu: (e) => {
              e.originalEvent.preventDefault();
              onMarkerRemove?.(marker.id);
            },
          }}
        >
          <Popup>{marker.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
