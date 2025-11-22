import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
import { useTripsStore } from "../../store/useTripsStore";
import { usePhotosStore } from "../../store/usePhotosStore";
import type { Photo } from "../../types";

interface PhotoMetadataFormProps {
  tripId: string;
  photo: Photo;
  open: boolean;
  onClose: () => void;
}

export const PhotoMetadataForm = ({
  tripId,
  photo,
  open,
  onClose,
}: PhotoMetadataFormProps) => {
  const trip = useTripsStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const { updatePhoto } = usePhotosStore();

  const [formData, setFormData] = useState({
    description: photo.description || "",
    captureDate: photo.captureDate || new Date().toISOString().split("T")[0],
    locationName: photo.location?.name || "",
    dayId: photo.dayId || "",
    activityId: photo.activityId || "",
  });

  useEffect(() => {
    setFormData({
      description: photo.description || "",
      captureDate: photo.captureDate || new Date().toISOString().split("T")[0],
      locationName: photo.location?.name || "",
      dayId: photo.dayId || "",
      activityId: photo.activityId || "",
    });
  }, [photo]);

  const handleSave = () => {
    const updates: Partial<Photo> = {
      description: formData.description,
      captureDate: formData.captureDate,
      dayId: formData.dayId || undefined,
      activityId: formData.activityId || undefined,
    };

    if (formData.locationName) {
      updates.location = {
        name: formData.locationName,
        lat: photo.location?.lat || 0,
        lng: photo.location?.lng || 0,
      };
    }

    updatePhoto(tripId, photo.id, updates);
    onClose();
  };

  // Get activities for selected day
  const selectedDay = trip?.days.find((d) => d.id === formData.dayId);
  const activities = selectedDay?.activities || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Photo Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Add a description for this photo..."
          />

          <TextField
            type="date"
            label="Capture Date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.captureDate}
            onChange={(e) =>
              setFormData({ ...formData, captureDate: e.target.value })
            }
          />

          <TextField
            label="Location Name"
            fullWidth
            value={formData.locationName}
            onChange={(e) =>
              setFormData({ ...formData, locationName: e.target.value })
            }
            placeholder="e.g., Eiffel Tower, Paris"
          />

          <TextField
            select
            label="Link to Day"
            fullWidth
            value={formData.dayId}
            onChange={(e) =>
              setFormData({
                ...formData,
                dayId: e.target.value,
                activityId: "", // Reset activity when day changes
              })
            }
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {trip?.days.map((day, index) => (
              <MenuItem key={day.id} value={day.id}>
                Day {index + 1} - {new Date(day.date).toLocaleDateString()}
              </MenuItem>
            ))}
          </TextField>

          {formData.dayId && activities.length > 0 && (
            <TextField
              select
              label="Link to Activity"
              fullWidth
              value={formData.activityId}
              onChange={(e) =>
                setFormData({ ...formData, activityId: e.target.value })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {activities.map((activity) => (
                <MenuItem key={activity.id} value={activity.id}>
                  {activity.location?.name || activity.title}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
