import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { X, MapPin } from "lucide-react";
import {
  DestinationSection,
  DateBudgetSection,
  CoverImageSection,
} from "./trip-form";
import { useTripsStore } from "../../../store/useTripsStore";
import { useWeatherStore } from "../../../store/useWeatherStore";

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTripModal = ({ isOpen, onClose }: CreateTripModalProps) => {
  const navigate = useNavigate();
  const { addTrip } = useTripsStore();
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    currency: "USD",
    coverImage: "",
  });

  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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

  const handleLocationSelect = (
    coords: { lat: number; lng: number } | null,
    address?: string
  ) => {
    setSelectedCoords(coords);
    if (address) {
      setFormData((prev) => ({ ...prev, destination: address }));
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTripId = await addTrip({
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

    if (newTripId) {
      useWeatherStore.getState().fetchTripWeather(newTripId);
      navigate(`/trip/${newTripId}`);
    }
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
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
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

      <DialogContent dividers>
        <Box component="form" id="create-trip-form" onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              label="Trip Name"
              placeholder="e.g., Summer in Tokyo"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <DestinationSection
              destination={formData.destination}
              onDestinationChange={(value) =>
                handleChange("destination", value)
              }
              selectedCoords={selectedCoords}
              onLocationSelect={handleLocationSelect}
            />

            <DateBudgetSection
              startDate={formData.startDate}
              endDate={formData.endDate}
              budget={formData.budget}
              currency={formData.currency}
              onChange={handleChange}
            />

            <CoverImageSection
              coverImage={formData.coverImage}
              onImageChange={handleImageUpload}
              onImageRemove={() => handleChange("coverImage", "")}
            />
          </Stack>
        </Box>
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
          form="create-trip-form"
          variant="contained"
          size="large"
          disabled={!selectedCoords}
          sx={{
            minWidth: 150,
            fontWeight: 700,
          }}
        >
          Create Trip
        </Button>
      </DialogActions>
    </Dialog>
  );
};
