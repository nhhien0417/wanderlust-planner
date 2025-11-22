import { Card, Box, Typography, IconButton, Chip } from "@mui/material";
import {
  Clock,
  MapPin,
  DollarSign,
  GripVertical,
  Landmark,
  UtensilsCrossed,
  Hotel,
  Car,
  Trash2,
} from "lucide-react";
import type { Activity } from "../../types";

interface ActivityCardProps {
  activity: Activity;
  isDragging?: boolean;
  isOverlay?: boolean;
  onDelete?: (id: string) => void;
  showDragHandle?: boolean;
}

export const    ActivityCard = ({
  activity,
  isDragging = false,
  isOverlay = false,
  onDelete,
  showDragHandle = true,
}: ActivityCardProps) => {
  const getIcon = (category: string) => {
    switch (category) {
      case "restaurant":
        return <UtensilsCrossed size={18} />;
      case "hotel":
        return <Hotel size={18} />;
      case "transport":
        return <Car size={18} />;
      default:
        return <Landmark size={18} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "restaurant":
        return "error";
      case "hotel":
        return "secondary";
      case "transport":
        return "info";
      default:
        return "primary";
    }
  };

  return (
    <Card
      elevation={isDragging ? 8 : 1}
      sx={{
        p: 2,
        mb: 1.5,
        cursor: showDragHandle ? "grab" : "default",
        opacity: isDragging ? 0.5 : 1,
        transform: isOverlay ? "rotate(3deg)" : "none",
        transition: "all 0.2s",
        border: "1px solid",
        borderColor: isDragging ? "primary.main" : "divider",
        "&:hover": {
          boxShadow: 3,
          borderColor: "primary.light",
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {/* Drag Handle */}
        {showDragHandle && (
          <Box
            sx={{
              color: "text.secondary",
              cursor: "grab",
              "&:active": { cursor: "grabbing" },
            }}
          >
            <GripVertical size={20} />
          </Box>
        )}

        {/* Icon */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${getCategoryColor(activity.category)}.light`,
            color: `${getCategoryColor(activity.category)}.dark`,
            flexShrink: 0,
          }}
        >
          {getIcon(activity.category)}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {activity.title}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 1 }}>
            {activity.startTime && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Clock size={14} />
                <Typography variant="caption" color="text.secondary">
                  {activity.startTime}
                  {activity.endTime && ` - ${activity.endTime}`}
                </Typography>
              </Box>
            )}

            {activity.location?.name && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <MapPin size={14} />
                <Typography variant="caption" color="text.secondary">
                  {activity.location.name}
                </Typography>
              </Box>
            )}

            {activity.cost && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <DollarSign size={14} />
                <Typography variant="caption" color="text.secondary">
                  ${activity.cost}
                </Typography>
              </Box>
            )}
          </Box>

          {activity.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {activity.description}
            </Typography>
          )}

          {activity.category && (
            <Chip
              label={activity.category}
              size="small"
              color={getCategoryColor(activity.category) as any}
              sx={{ mt: 1, textTransform: "capitalize" }}
            />
          )}
        </Box>

        {/* Delete Button */}
        {onDelete && (
          <IconButton
            size="small"
            onClick={() => onDelete(activity.id)}
            sx={{
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.light",
              },
            }}
          >
            <Trash2 size={18} />
          </IconButton>
        )}
      </Box>
    </Card>
  );
};
