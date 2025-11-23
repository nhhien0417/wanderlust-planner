import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  Clock,
  DollarSign,
  FileText,
  Landmark,
  UtensilsCrossed,
  Hotel,
  Car,
  Building2,
} from "lucide-react";
import type { Activity } from "../../../../types";

const CATEGORIES = [
  { id: "attraction", label: "Attraction", icon: Landmark },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "hotel", label: "Hotel", icon: Hotel },
  { id: "transport", label: "Transport", icon: Car },
  { id: "other", label: "Other", icon: Building2 },
] as const;

export interface ActivityFormData {
  title: string;
  description: string;
  category: Activity["category"];
  startTime: string;
  endTime: string;
  cost: string;
}

interface ActivityFormSectionProps {
  formData: ActivityFormData;
  onChange: (data: ActivityFormData) => void;
}

export const ActivityFormSection = ({
  formData,
  onChange,
}: ActivityFormSectionProps) => {
  const handleChange = (field: keyof ActivityFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  return (
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
        onChange={(e) => handleChange("title", e.target.value)}
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
              onClick={() => handleChange("category", cat.id)}
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
          onChange={(e) => handleChange("startTime", e.target.value)}
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
          onChange={(e) => handleChange("endTime", e.target.value)}
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
          onChange={(e) => handleChange("cost", e.target.value)}
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
        onChange={(e) => handleChange("description", e.target.value)}
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
  );
};
