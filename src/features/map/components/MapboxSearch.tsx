import { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  CircularProgress,
  ClickAwayListener,
  IconButton,
} from "@mui/material";
import { Search, MapPin, X } from "lucide-react";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibmhoaWVuIiwiYSI6ImNtaWl5ZmRreDB3eTYzZG14cTltMHcyNncifQ.JI8lMLMekrydACNXkLGVJw";

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
}

interface MapboxSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  proximity?: { lat: number; lng: number };
}

export const MapboxSearch = ({
  onLocationSelect,
  value,
  onChange,
  proximity,
}: MapboxSearchProps) => {
  const [internalQuery, setInternalQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const query = value !== undefined ? value : internalQuery;

  const handleQueryChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalQuery(newValue);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchMapbox = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&limit=10&language=vi`;

        if (proximity) {
          url += `&proximity=${proximity.lng},${proximity.lat}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setResults(data.features || []);

        // Only show results if THIS input is focused
        if (document.activeElement === inputRef.current) {
          setShowResults(true);
        }
      } catch (error) {
        console.error("Mapbox search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchMapbox, 500);
    return () => clearTimeout(debounce);
  }, [query, proximity]);

  const handleSelect = (result: SearchResult) => {
    onLocationSelect(result.center[1], result.center[0], result.place_name);
    handleQueryChange(result.place_name);
    setShowResults(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setShowResults(false)}>
      <Box sx={{ position: "relative", width: "100%", zIndex: 1000 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          placeholder="Search places..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={16} />
                ) : query ? (
                  <IconButton
                    size="small"
                    onClick={() => handleQueryChange("")}
                    sx={{ p: 0.5 }}
                  >
                    <X size={14} />
                  </IconButton>
                ) : null}
              </InputAdornment>
            ),
            sx: {
              bgcolor: "white",
              borderRadius: 2,
              "& fieldset": { border: "none" },
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            },
          }}
        />

        {showResults && results.length > 0 && (
          <Paper
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              mt: 1,
              maxHeight: 300,
              overflow: "auto",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <List dense>
              {results.map((result) => (
                <ListItem key={result.id} disablePadding>
                  <ListItemButton onClick={() => handleSelect(result)}>
                    <MapPin
                      size={16}
                      style={{ marginRight: 8, flexShrink: 0 }}
                    />
                    <ListItemText
                      primary={result.place_name.split(",")[0]}
                      secondary={result.place_name}
                      primaryTypographyProps={{ fontWeight: 500 }}
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
      </Box>
    </ClickAwayListener>
  );
};
