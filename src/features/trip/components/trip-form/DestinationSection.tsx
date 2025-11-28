import { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import { MapPin, Map as MapIcon, X } from "lucide-react";
import { MapboxSearch } from "../../../map/components/MapboxSearch";
import { MapboxMap } from "../../../map/Map";

interface DestinationSectionProps {
  destination: string;
  onDestinationChange: (value: string) => void;
  selectedCoords: { lat: number; lng: number } | null;
  onLocationSelect: (
    coords: { lat: number; lng: number } | null,
    address?: string
  ) => void;
}

export const DestinationSection = ({
  destination,
  onDestinationChange,
  selectedCoords,
  onLocationSelect,
}: DestinationSectionProps) => {
  const [showMap, setShowMap] = useState(false);
  const [viewState, setViewState] = useState({
    center: [16.0544, 108.2022] as [number, number],
    zoom: 13,
  });

  const handleMapLocationSelect = (lat: number, lng: number, name?: string) => {
    // If name is provided (from POI or Search), use it.
    // Otherwise keep existing destination or use a generic one if empty
    const newDestination =
      name || destination || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    onLocationSelect({ lat, lng }, newDestination);
    onDestinationChange(newDestination);
    setViewState({ center: [lat, lng], zoom: 15 });
  };

  const handleSearchSelect = (lat: number, lng: number, name: string) => {
    onLocationSelect({ lat, lng }, name);
    onDestinationChange(name);
    setViewState({ center: [lat, lng], zoom: 15 });
  };

  const handleRemovePin = () => {
    onLocationSelect(null);
    onDestinationChange("");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <MapboxSearch
            value={destination}
            onChange={onDestinationChange}
            onLocationSelect={handleSearchSelect}
            proximity={{ lat: viewState.center[0], lng: viewState.center[1] }}
          />
        </Box>
        <Button
          variant="outlined"
          onClick={() => setShowMap(!showMap)}
          startIcon={<MapIcon size={18} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            whiteSpace: "nowrap",
            minWidth: "fit-content",
            height: "40px", // Match search height roughly
          }}
        >
          {showMap ? "Hide" : "Show"} Map
        </Button>
      </Box>

      {/* Map Section */}
      <Collapse in={showMap}>
        <Box>
          {selectedCoords && (
            <Paper
              elevation={2}
              sx={{
                mb: 2,
                p: 2,
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  backgroundColor: "primary.main",
                  borderRadius: 2,
                  color: "white",
                }}
              >
                <MapPin size={20} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Selected Location
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {destination || "Location selected"}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={handleRemovePin}
                sx={{ color: "error.main" }}
              >
                <X size={18} />
              </IconButton>
            </Paper>
          )}

          <Box sx={{ borderRadius: 2, overflow: "hidden" }}>
            <MapboxMap
              center={viewState.center}
              zoom={viewState.zoom}
              onLocationSelect={handleMapLocationSelect}
              onMarkerRemove={handleRemovePin}
              markers={
                selectedCoords
                  ? [
                      {
                        id: "selected",
                        position: [selectedCoords.lat, selectedCoords.lng],
                        title: destination || "Selected location",
                      },
                    ]
                  : []
              }
            />
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};
