import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
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

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    setViewState({
      center: [lat, lng],
      zoom: 15,
    });
    setSelectedLocation({
      name: name.split(",")[0],
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

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const name =
        data.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      handleLocationSelect(lat, lng, name);
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      handleLocationSelect(
        lat,
        lng,
        `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MapPin size={24} />
          <Typography variant="h6" fontWeight="bold">
            Add Activity
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <X size={20} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: "33%",
            borderRight: 1,
            borderColor: "divider",
            p: 2,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "grey.50",
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Search Location
            </Typography>
            <LocationSearch onLocationSelect={handleLocationSelect} />
          </Box>

          {selectedLocation ? (
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "primary.light",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MapPin size={20} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedLocation.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {selectedLocation.address}
                  </Typography>
                </Box>
              </Box>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={handleAdd}
              >
                Add to Itinerary
              </Button>
            </Paper>
          ) : (
            <Box
              sx={{
                mt: "auto",
                textAlign: "center",
                py: 6,
                color: "text.disabled",
              }}
            >
              <MapPin size={48} opacity={0.2} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Search for a location to add it to your trip
              </Typography>
            </Box>
          )}
        </Box>

        {/* Map Area */}
        <Box sx={{ flexGrow: 1, position: "relative" }}>
          <Map
            center={viewState.center}
            zoom={viewState.zoom}
            onLocationSelect={handleMapClick}
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
      </Box>
    </Dialog>
  );
};
