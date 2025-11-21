import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import {
  X,
  MapPin,
  Plus,
  Building2,
  UtensilsCrossed,
  Hotel,
  Car,
  Landmark,
  Clock,
  DollarSign,
  FileText,
  Map as MapIcon,
  Search,
} from "lucide-react";
import { Map } from "./Map";
import type { Activity } from "../types";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (activityData: Omit<Activity, "id" | "tripId" | "dayId">) => void;
}

const CATEGORIES = [
  { id: "attraction", label: "Attraction", icon: Landmark },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "hotel", label: "Hotel", icon: Hotel },
  { id: "transport", label: "Transport", icon: Car },
  { id: "other", label: "Other", icon: Building2 },
] as const;

interface SearchResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}
export const AddActivityModal = ({
  isOpen,
  onClose,
  onAdd,
}: AddActivityModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "attraction" as Activity["category"],
    startTime: "",
    endTime: "",
    cost: "",
  });

  const [viewState, setViewState] = useState({
    center: [16.0544, 108.2022] as [number, number],
    zoom: 13,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      const data = await response.json();

      const results: SearchResult[] = data.map((item: any) => ({
        name: item.name || item.display_name.split(",")[0],
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));

      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: SearchResult) => {
    setSelectedLocation({
      name: result.name,
      lat: result.lat,
      lng: result.lng,
      address: result.displayName,
    });
    setViewState({
      center: [result.lat, result.lng],
      zoom: 15,
    });
    if (!formData.title) {
      setFormData((prev) => ({ ...prev, title: result.name }));
    }
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const name =
        data.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      setSelectedLocation({
        name: name.split(",")[0],
        lat,
        lng,
        address: name,
      });
      if (!formData.title) {
        setFormData((prev) => ({ ...prev, title: name.split(",")[0] }));
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      const name = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setSelectedLocation({
        name,
        lat,
        lng,
        address: name,
      });
    }
  };

  const handleAdd = () => {
    if (!formData.title) return;

    onAdd({
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category,
      location: selectedLocation
        ? {
            id: "",
            name: selectedLocation.name,
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            address: selectedLocation.address,
          }
        : undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
    });

    // Reset form
    setSelectedLocation(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowMap(false);
    setFormData({
      title: "",
      description: "",
      category: "attraction",
      startTime: "",
      endTime: "",
      cost: "",
    });
    onClose();
  };

  const handleClose = () => {
    setSelectedLocation(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowMap(false);
    setFormData({
      title: "",
      description: "",
      category: "attraction",
      startTime: "",
      endTime: "",
      cost: "",
    });
    onClose();
  };

  const isValid = formData.title.trim().length > 0;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "90vh",
          borderRadius: 2,
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Plus size={26} />
          <Typography variant="h6" fontWeight="bold">
            Add New Activity
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
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
      <Box sx={{ p: 3, maxHeight: "calc(90vh - 80px)", overflowY: "auto" }}>
        {/* Location Search Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Location
          </Typography>
          <Box sx={{ display: "flex", gap: 1, height: 55 }}>
            <TextField
              fullWidth
              placeholder="Search for a place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ backgroundColor: "white", height: 55 }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              sx={{ minWidth: 100, height: 55 }}
            >
              {isSearching ? "..." : "Search"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowMap(!showMap)}
              startIcon={<MapIcon size={18} />}
              sx={{ minWidth: 150, height: 55 }}
            >
              {showMap ? "Hide" : "Show"} Map
            </Button>
          </Box>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Paper sx={{ mt: 2, maxHeight: 200, overflow: "auto" }}>
              <List dense>
                {searchResults.map((result, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelectLocation(result)}
                    >
                      <MapPin size={16} style={{ marginRight: 8 }} />
                      <ListItemText
                        primary={result.name}
                        secondary={result.displayName}
                        secondaryTypographyProps={{
                          noWrap: true,
                          fontSize: "0.75rem",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

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
                onClick={() => setSelectedLocation(null)}
                sx={{ color: "error.main" }}
              >
                <X size={18} />
              </IconButton>
            </Paper>
          )}

          {/* Map */}
          <Collapse in={showMap}>
            <Box
              sx={{ mt: 2, height: 300, borderRadius: 2, overflow: "hidden" }}
            >
              <Map
                center={viewState.center}
                zoom={viewState.zoom}
                onLocationSelect={handleMapClick}
                markers={
                  selectedLocation
                    ? [
                        {
                          id: "selected",
                          position: [
                            selectedLocation.lat,
                            selectedLocation.lng,
                          ],
                          title: selectedLocation.name,
                        },
                      ]
                    : []
                }
              />
            </Box>
          </Collapse>
        </Box>

        {/* Activity Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Activity Details
          </Typography>

          {/* Title */}
          <TextField
            fullWidth
            label="Title *"
            placeholder="e.g. Visit Marble Mountains"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            sx={{ mb: 2, backgroundColor: "white" }}
          />

          {/* Category */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Chip
                  key={cat.id}
                  icon={<Icon size={16} />}
                  label={cat.label}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      category: cat.id as Activity["category"],
                    })
                  }
                  color={formData.category === cat.id ? "primary" : "default"}
                  sx={{
                    py: 2,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  }}
                />
              );
            })}
          </Box>

          {/* Time Range */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              type="time"
              label="Start Time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Clock size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, backgroundColor: "white" }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="time"
              label="End Time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Clock size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, backgroundColor: "white" }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="number"
              label="Estimated Cost"
              placeholder="0.00"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DollarSign size={18} />
                  </InputAdornment>
                ),
                inputProps: {
                  min: 0,
                },
              }}
              sx={{ mb: 2, backgroundColor: "white", maxWidth: 200 }}
            />
          </Box>

          {/* Description */}
          <TextField
            fullWidth
            multiline
            label="Description"
            placeholder="What's special about this place?"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FileText size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2, backgroundColor: "white" }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleClose}
            sx={{ px: 3, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<Plus size={18} />}
            onClick={handleAdd}
            disabled={!isValid}
            sx={{
              px: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add Activity
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
