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
import { X, MapPin, Image as ImageIcon } from "lucide-react";
import { useTripStore } from "../store/useTripStore";
import todayDate from "../utils/todayDate";

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
