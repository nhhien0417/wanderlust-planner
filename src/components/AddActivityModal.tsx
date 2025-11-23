import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { X, Plus } from "lucide-react";
import type { Activity } from "../types";
import {
  LocationSection,
  ActivityFormSection,
  type LocationData,
  type ActivityFormData,
} from "./activities";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (activityData: Omit<Activity, "id" | "tripId" | "dayId">) => void;
}

export const AddActivityModal = ({
  isOpen,
  onClose,
  onAdd,
}: AddActivityModalProps) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );

  const [formData, setFormData] = useState<ActivityFormData>({
    title: "",
    description: "",
    category: "attraction",
    startTime: "",
    endTime: "",
    cost: "",
  });

  const handleLocationSelect = (location: LocationData | null) => {
    setSelectedLocation(location);
    if (location && !formData.title) {
      setFormData((prev) => ({ ...prev, title: location.name }));
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

    handleClose();
  };

  const handleClose = () => {
    setSelectedLocation(null);
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
        <LocationSection
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
        />

        <ActivityFormSection formData={formData} onChange={setFormData} />

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
