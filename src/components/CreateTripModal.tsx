import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import { X, MapPin, Image as ImageIcon, Map as MapIcon } from "lucide-react";
import { useTripStore } from "../store/useTripStore";
import todayDate from "../utils/todayDate";
import { Map } from "./Map";
import { reverseGeocode } from "../api/weatherApi";
import { CURRENCIES } from "../utils/currency";

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTripModal = ({ isOpen, onClose }: CreateTripModalProps) => {
  const addTrip = useTripStore((state) => state.addTrip);
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    currency: "USD",
    coverImage: "",
  });

  const [showMap, setShowMap] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [viewState, setViewState] = useState({
    center: [16.0544, 108.2022] as [number, number],
    zoom: 13,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapRightClick = async (lat: number, lng: number) => {
    // Set coordinates
    setSelectedCoords({ lat, lng });
    setViewState({ center: [lat, lng], zoom: 15 });

    // Reverse geocode to get city name
    const cityName = await reverseGeocode(lat, lng);
    if (cityName) {
      setFormData({ ...formData, destination: cityName });
    }
  };

  const handleRemovePin = () => {
    setSelectedCoords(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addTrip({
      name: formData.name,
      destination: formData.destination,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      budget: Number(formData.budget) || 0,
      currency: formData.currency,
      coverImage: formData.coverImage,
      coordinates: selectedCoords || undefined,
    });

    onClose();
    // Reset form
    setFormData({
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      budget: "",
      currency: "USD",
      coverImage: "",
    });
    setSelectedCoords(null);
    setShowMap(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2.5,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MapPin size={24} />
          <Typography variant="h6" fontWeight="bold">
            Plan New Trip
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
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              required
              fullWidth
              label="Trip Name"
              placeholder="e.g., Summer in Tokyo"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <TextField
              required
              fullWidth
              label="Destination"
              placeholder="Where to?"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MapPin size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="outlined"
              onClick={() => setShowMap(!showMap)}
              startIcon={<MapIcon size={18} />}
              sx={{ textTransform: "none", fontWeight: 600 }}
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
                      background:
                        "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
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
                        {formData.destination || "Location selected"}
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
                              position: [
                                selectedCoords.lat,
                                selectedCoords.lng,
                              ],
                              title:
                                formData.destination || "Selected location",
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

            <Stack direction="row" spacing={2}>
              <TextField
                required
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                inputProps={{ min: todayDate }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                required
                fullWidth
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                inputProps={{ min: formData.startDate }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Budget (Optional)"
                placeholder="0"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                InputProps={{
                  inputProps: {
                    min: 0,
                  },
                }}
              />

              <TextField
                select
                required
                fullWidth
                label="Currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              >
                {CURRENCIES.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Box>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="cover-image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="cover-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<ImageIcon />}
                  sx={{
                    height: 56,
                    borderStyle: "dashed",
                    borderColor: formData.coverImage
                      ? "primary.main"
                      : "grey.400",
                    color: formData.coverImage
                      ? "primary.main"
                      : "text.secondary",
                  }}
                >
                  {formData.coverImage
                    ? "Change Cover Image"
                    : "Upload Cover Image"}
                </Button>
              </label>
              {formData.coverImage && (
                <Box
                  sx={{
                    mt: 2,
                    position: "relative",
                    width: "100%",
                    height: 160,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={formData.coverImage}
                    alt="Cover Preview"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      setFormData({ ...formData, coverImage: "" });
                    }}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(0,0,0,0.5)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    }}
                  >
                    <X size={16} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{ px: 3, py: 2.5, gap: 1.5, backgroundColor: "grey.50" }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            size="large"
            sx={{
              minWidth: 120,
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              minWidth: 150,
              fontWeight: 700,
            }}
          >
            Create Trip
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
