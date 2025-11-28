import { useRef, useEffect, useState, useCallback } from "react";
import Map, {
  NavigationControl,
  GeolocateControl,
  Marker,
  Popup,
  FullscreenControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import { MapPin, X } from "lucide-react";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibmhoaWVuIiwiYSI6ImNtaWl5ZmRreDB3eTYzZG14cTltMHcyNncifQ.JI8lMLMekrydACNXkLGVJw";

interface MarkerData {
  id: string;
  position: [number, number];
  title: string;
  description?: string;
  color?: string;
}

interface MapboxMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  onLocationSelect?: (lat: number, lng: number, name?: string) => void;
  onMarkerClick?: (marker: MarkerData) => void;
  onMarkerRemove?: (markerId: string) => void;
  interactive?: boolean;
}

export const MapboxMap = ({
  center = [16.0544, 108.2022],
  zoom = 13,
  markers = [],
  onLocationSelect,
  onMarkerClick,
  onMarkerRemove,
  interactive = true,
}: MapboxMapProps) => {
  const mapRef = useRef<any>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [center[1], center[0]],
        zoom: zoom,
        duration: 2000,
      });
    }
  }, [center, zoom]);

  const handleMapClick = useCallback(
    (event: any) => {
      const { lng, lat } = event.lngLat;
      const point = event.point;

      // Check for POI clicks
      if (mapRef.current) {
        const features = mapRef.current.queryRenderedFeatures(point, {
          layers: ["poi-label"],
        });

        if (features && features.length > 0) {
          const feature = features[0];
          const name = feature.properties?.name;
          // If we clicked a POI, use its name
          onLocationSelect?.(lat, lng, name);
          return;
        }
      }

      onLocationSelect?.(lat, lng);
    },
    [onLocationSelect]
  );

  const [cursor, setCursor] = useState("grab");

  const onMouseEnter = useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = useCallback(() => setCursor("grab"), []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "350px",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        "& .mapboxgl-map": {
          height: "100% !important",
        },
      }}
    >
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom: zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleMapClick}
        reuseMaps
        cursor={cursor}
        interactiveLayerIds={["poi-label"]}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {interactive && (
          <>
            <FullscreenControl position="top-right" />
            <NavigationControl position="bottom-right" />
            <GeolocateControl position="top-right" />
          </>
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.position[1]}
            latitude={marker.position[0]}
            anchor="bottom"
            onClick={(e: any) => {
              e.originalEvent.stopPropagation();
              setSelectedMarker(marker);
              onMarkerClick?.(marker);
            }}
          >
            <div
              onContextMenu={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkerRemove?.(marker.id);
              }}
            >
              <MapPin
                size={32}
                fill={marker.color || "#ef4444"}
                color="white"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  cursor: "pointer",
                  transform: "scale(1)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.transform = "scale(1.2)";
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
            </div>
          </Marker>
        ))}

        {selectedMarker && (
          <Popup
            longitude={selectedMarker.position[1]}
            latitude={selectedMarker.position[0]}
            anchor="top"
            onClose={() => setSelectedMarker(null)}
            closeButton={false}
            offset={10}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                minWidth: 200,
                maxWidth: 300,
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {selectedMarker.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setSelectedMarker(null)}
                  sx={{ mt: -0.5, mr: -0.5 }}
                >
                  <X size={14} />
                </IconButton>
              </Box>
              {selectedMarker.description && (
                <Typography variant="body2" color="text.secondary">
                  {selectedMarker.description}
                </Typography>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {selectedMarker.position[0].toFixed(4)},{" "}
                {selectedMarker.position[1].toFixed(4)}
              </Typography>
            </Paper>
          </Popup>
        )}
      </Map>
    </Box>
  );
};
