import { Box, Container, Typography, Button } from "@mui/material";
import { Calendar, MapPin, DollarSign, Share } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Trip } from "../../types";

interface TripHeaderProps {
  trip: Trip;
  onShare: () => void;
  onChangeCover: () => void;
}

export const TripHeader = ({
  trip,
  onShare,
  onChangeCover,
}: TripHeaderProps) => {
  return (
    <Box
      sx={{
        height: 300,
        position: "relative",
        backgroundImage: `url(${
          trip.coverImage ||
          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)",
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          pb: 4,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Box sx={{ color: "white" }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              {trip.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MapPin size={20} />
                <Typography variant="h6">{trip.destination}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Calendar size={20} />
                <Typography variant="h6">
                  {format(parseISO(trip.startDate), "MMM d")} -{" "}
                  {format(parseISO(trip.endDate), "MMM d, yyyy")}
                </Typography>
              </Box>
              {trip.budget > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DollarSign size={20} />
                  <Typography variant="h6">
                    ${trip.budget.toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Share size={18} />}
              onClick={onShare}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              Share
            </Button>
            <Button
              variant="outlined"
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.5)" }}
              onClick={onChangeCover}
            >
              View Cover
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
