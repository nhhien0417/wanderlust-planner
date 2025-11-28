import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Collapse,
} from "@mui/material";
import { Search, Map as MapIcon, MapPin, X } from "lucide-react";
import { Map } from "../../../map/components/Map";

interface SearchResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
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
    const location: LocationData = {
      name: result.name,
      lat: result.lat,
      lng: result.lng,
      address: result.displayName,
    };

    onLocationSelect(location);

    setViewState({
      center: [result.lat, result.lng],
      zoom: 15,
    });
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

      const location: LocationData = {
        name: name.split(",")[0],
        lat,
        lng,
        address: name,
      };

      onLocationSelect(location);
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      const name = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const location: LocationData = {
        name,
        lat,
        lng,
        address: name,
      };
      onLocationSelect(location);
    }
  };

  return (
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
                <ListItemButton onClick={() => handleSelectLocation(result)}>
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
            onClick={() => onLocationSelect(null)}
            sx={{ color: "error.main" }}
          >
            <X size={18} />
          </IconButton>
        </Paper>
      )}

      {/* Map */}
      <Collapse in={showMap}>
        <Box sx={{ mt: 2, height: 300, borderRadius: 2, overflow: "hidden" }}>
          <Map
            center={viewState.center}
            zoom={viewState.zoom}
            onLocationSelect={handleMapClick}
            onRightClick={handleMapClick}
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
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1, fontStyle: "italic" }}
        >
          💡 Right-click on the map to select location
        </Typography>
      </Collapse>
    </Box>
  );
};
