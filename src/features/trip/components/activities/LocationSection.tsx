import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Button,
  Paper,
} from "@mui/material";
import { Map as MapIcon, MapPin, X } from "lucide-react";
import { MapboxSearch } from "../../../map/components/MapboxSearch";
import { MapboxMap } from "../../../map/Map";

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface LocationSectionProps {
  selectedLocation: LocationData | null;
  onLocationSelect: (location: LocationData | null) => void;
}

export const LocationSection = ({
  selectedLocation,
  onLocationSelect,
}: LocationSectionProps) => {
  const [showMap, setShowMap] = useState(false);
  const [viewState, setViewState] = useState({
    center: [16.0544, 108.2022] as [number, number],
    zoom: 13,
  });

  const handleSearchSelect = (lat: number, lng: number, name: string) => {
    const location: LocationData = {
      name: name.split(",")[0],
      lat,
      lng,
      address: name,
    };
    onLocationSelect(location);
    setViewState({ center: [lat, lng], zoom: 15 });
  };

  const handleMapLocationSelect = (lat: number, lng: number, name?: string) => {
    const locationName =
      name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const location: LocationData = {
      name: locationName.split(",")[0],
      lat,
      lng,
      address: locationName,
    };
    onLocationSelect(location);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Location
      </Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <MapboxSearch
            onLocationSelect={handleSearchSelect}
            proximity={{ lat: viewState.center[0], lng: viewState.center[1] }}
          />
        </Box>
        <Button
          variant="outlined"
          onClick={() => setShowMap(!showMap)}
          startIcon={<MapIcon size={18} />}
          sx={{
            minWidth: "fit-content",
            height: "40px", // Match search height
            whiteSpace: "nowrap",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {showMap ? "Hide" : "Show"} Map
        </Button>
      </Box>

      {/* Selected Location */}
      {selectedLocation && (
        <Paper
          elevation={2}
          sx={{
            mt: 2,
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
              {selectedLocation.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {selectedLocation.address}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => onLocationSelect(null)}
            sx={{ color: "error.main" }}
          >
            <X size={18} />
          </IconButton>
        </Paper>
      )}

      {/* Map */}
      <Collapse in={showMap}>
        <Box sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}>
          <MapboxMap
            center={viewState.center}
            zoom={viewState.zoom}
            onLocationSelect={handleMapLocationSelect}
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
        </Box>
      </Collapse>
    </Box>
  );
};
