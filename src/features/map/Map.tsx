import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { MapPin, X, Info } from "lucide-react";
import { Map } from "../../components/Map";
import { LocationSearch } from "../../components/LocationSearch";
import { useTripsStore } from "../../store/useTripsStore";
import { v4 as uuidv4 } from "uuid";
import type { Location } from "../../types";

interface TripMapProps {
  tripId: string;
}

export const TripMap = ({ tripId }: TripMapProps) => {
  const { trips } = useTripsStore();
  const [viewState, setViewState] = useState({
    center: [16.0544, 108.2022] as [number, number],
    zoom: 13,
  });
  const [markers, setMarkers] = useState<Location[]>([]);
  const [isAddMode, setIsAddMode] = useState(false);

  const trip = trips.find((t) => t.id === tripId);

  // Get all markers from trip activities
  const activityMarkers = useMemo(() => {
    if (!trip) return [];
    const allActivities = trip.days.flatMap((day) => day.activities);
    return allActivities.map((activity) => ({
      id: activity.id,
      position: [activity.location?.lat, activity.location?.lng] as [
        number,
        number
      ],
      title: activity.location?.name || activity.title,
    }));
  }, [trip]);

  // Combine activity markers with custom markers
  const allMarkers = useMemo(() => {
    return [
      ...activityMarkers,
      ...markers.map((m) => ({
        id: m.id,
        position: [m.lat, m.lng] as [number, number],
        title: m.name,
      })),
    ];
  }, [activityMarkers, markers]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setViewState({
      center: [lat, lng],
      zoom: 13,
    });
  };

  const handleMapClick = async (lat: number, lng: number) => {
    if (!isAddMode) return;

    // Reverse geocode to get location name
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();

      const newMarker: Location = {
        id: uuidv4(),
        name:
          data.display_name?.split(",")[0] || `Marker ${markers.length + 1}`,
        lat,
        lng,
        address: data.display_name,
        type: "other",
      };

      setMarkers([...markers, newMarker]);
      setIsAddMode(false);
    } catch (error) {
      console.error("Failed to geocode location:", error);

      // Fallback if geocoding fails
      const newMarker: Location = {
        id: uuidv4(),
        name: `Marker ${markers.length + 1}`,
        lat,
        lng,
        type: "other",
      };
      setMarkers([...markers, newMarker]);
      setIsAddMode(false);
    }
  };

  const handleRemoveMarker = (markerId: string) => {
    setMarkers(markers.filter((m) => m.id !== markerId));
  };

  const handleMarkerClick = (marker: Location) => {
    setViewState({
      center: [marker.lat, marker.lng],
      zoom: 15,
    });
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: "divider",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              🗺️ Trip Map
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {trip?.name || "Loading..."}
            </Typography>
          </Box>
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </Box>

        {/* Info Banner */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Info size={20} />
          <Typography variant="body2">
            {isAddMode
              ? "📍 Click anywhere on the map to add a marker"
              : "👆 Toggle 'Add Marker Mode' below to place markers on the map"}
          </Typography>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar - Marker List */}
        <Paper
          elevation={3}
          sx={{
            width: 320,
            borderRadius: 0,
            borderRight: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Markers ({allMarkers.length})
            </Typography>

            <Tooltip
              title={
                isAddMode
                  ? "Click on map to add marker"
                  : "Enable add marker mode"
              }
            >
              <Chip
                icon={<MapPin size={16} />}
                label={isAddMode ? "Adding Marker..." : "Add Marker Mode"}
                onClick={() => setIsAddMode(!isAddMode)}
                color={isAddMode ? "primary" : "default"}
                sx={{
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 2,
                  },
                }}
              />
            </Tooltip>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto" }}>
            {/* Activity Markers */}
            {activityMarkers.length > 0 && (
              <>
                <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    FROM ACTIVITIES ({activityMarkers.length})
                  </Typography>
                </Box>
                <List dense>
                  {activityMarkers.map((marker) => (
                    <ListItem
                      key={marker.id}
                      component="button"
                      onClick={() =>
                        handleMarkerClick({
                          id: marker.id,
                          name: marker.title,
                          lat: marker.position[0],
                          lng: marker.position[1],
                        })
                      }
                      sx={{
                        "&:hover": {
                          bgcolor: "primary.50",
                        },
                      }}
                    >
                      <MapPin
                        size={20}
                        style={{ marginRight: 12, color: "#667eea" }}
                      />
                      <ListItemText
                        primary={marker.title}
                        secondary={`${marker.position[0].toFixed(
                          4
                        )}, ${marker.position[1].toFixed(4)}`}
                        primaryTypographyProps={{
                          fontWeight: 500,
                          noWrap: true,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider />
              </>
            )}

            {/* Custom Markers */}
            {markers.length > 0 && (
              <>
                <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    CUSTOM MARKERS ({markers.length})
                  </Typography>
                </Box>
                <List dense>
                  {markers.map((marker) => (
                    <ListItem
                      key={marker.id}
                      component="button"
                      onClick={() => handleMarkerClick(marker)}
                      sx={{
                        "&:hover": {
                          bgcolor: "primary.50",
                        },
                      }}
                    >
                      <MapPin
                        size={20}
                        style={{ marginRight: 12, color: "#10b981" }}
                      />
                      <ListItemText
                        primary={marker.name}
                        secondary={`${marker.lat.toFixed(
                          4
                        )}, ${marker.lng.toFixed(4)}`}
                        primaryTypographyProps={{
                          fontWeight: 500,
                          noWrap: true,
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMarker(marker.id);
                          }}
                          sx={{
                            color: "error.main",
                            "&:hover": {
                              bgcolor: "error.50",
                            },
                          }}
                        >
                          <X size={18} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {/* Empty State */}
            {activityMarkers.length === 0 && markers.length === 0 && (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <MapPin size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <Typography variant="body2">
                  No markers yet. Enable "Add Marker Mode" and click on the map
                  to add markers.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Map */}
        <Box sx={{ flex: 1, position: "relative" }}>
          <Map
            center={viewState.center}
            zoom={viewState.zoom}
            markers={allMarkers}
            onLocationSelect={handleMapClick}
          />
        </Box>
      </Box>
    </Box>
  );
};
