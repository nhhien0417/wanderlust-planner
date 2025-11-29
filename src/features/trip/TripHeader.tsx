import { Box, Typography, Button, Paper } from "@mui/material";
import { Calendar, MapPin, Share2, Image as ImageIcon } from "lucide-react";
import type { Trip } from "../../types";

interface TripHeaderProps {
  trip: Trip;
  onShareClick: () => void;
  onCoverClick: () => void;
}

export const TripHeader = ({
  trip,
  onShareClick,
  onCoverClick,
}: TripHeaderProps) => {
  return (
    <Paper
      sx={{
        position: "relative",
        height: 300,
        borderRadius: 0,
        overflow: "hidden",
        mb: 4,
      }}
    >
      {trip.coverImage ? (
        <Box
          component="img"
          src={trip.coverImage}
          alt={trip.name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageIcon size={64} color="white" opacity={0.5} />
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          p: 4,
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {trip.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MapPin size={20} />
                <Typography>{trip.destination}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Calendar size={20} />
                <Typography>
                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Share2 size={18} />}
              onClick={onShareClick}
              sx={{
                bgcolor: "white",
                color: "black",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              Share
            </Button>
            <Button
              onClick={onCoverClick}
              variant="outlined"
              startIcon={<ImageIcon size={18} />}
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  borderColor: "grey.300",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Cover Image
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
