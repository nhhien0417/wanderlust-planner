import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import { X, MapPin, Image as ImageIcon } from "lucide-react";
import { useTripStore } from "../store/useTripStore";

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
    coverImage: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addTrip({
      name: formData.name,
      destination: formData.destination,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      budget: Number(formData.budget) || 0,
      coverImage: formData.coverImage,
    });

    onClose();
    // Reset form
    setFormData({
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      budget: "",
      coverImage: "",
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Plan New Trip
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6}>
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
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Budget (Optional)"
                placeholder="0"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="url"
                label="Cover Image URL (Optional)"
                placeholder="https://..."
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" size="large">
            Create Trip
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
