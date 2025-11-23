import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Collapse,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import { MapPin, Map as MapIcon, X } from "lucide-react";
import { Map } from "../Map";
import { reverseGeocode } from "../../api/weatherApi";

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

  const handleMapRightClick = async (lat: number, lng: number) => {
    // Reverse geocode to get city name
    const cityName = await reverseGeocode(lat, lng);
    onLocationSelect({ lat, lng }, cityName || undefined);
    setViewState({ center: [lat, lng], zoom: 15 });
  };

  const handleRemovePin = () => {
    onLocationSelect(null);
  };

  return (
    <Box>
      <TextField
        required
        fullWidth
        label="Destination"
        placeholder="Where to?"
        value={destination}
        onChange={(e) => onDestinationChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MapPin size={20} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Button
        variant="outlined"
        onClick={() => setShowMap(!showMap)}
        startIcon={<MapIcon size={18} />}
        sx={{ textTransform: "none", fontWeight: 600, mb: 2 }}
      >
        {showMap ? "Hide" : "Show"} Map
      </Button>

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

          <Box sx={{ height: 300, borderRadius: 2, overflow: "hidden" }}>
            <Map
              center={viewState.center}
              zoom={viewState.zoom}
              onRightClick={handleMapRightClick}
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
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1, fontStyle: "italic" }}
          >
            💡 Right-click on the map to select your destination
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};
