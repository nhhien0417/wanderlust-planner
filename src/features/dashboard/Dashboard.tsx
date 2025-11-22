import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import { Plus, Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../../store/useTripStore";
import { useUIStore } from "../../store/useUIStore";

export const Dashboard = () => {
  const { trips } = useTripStore();
  const { openCreateTripModal } = useUIStore();
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Welcome back!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to plan your next adventure?
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<Plus size={20} />}
          onClick={openCreateTripModal}
          sx={{
            boxShadow: 3,
            "&:hover": { boxShadow: 6 },
          }}
        >
          Create New Trip
        </Button>
      </Box>

      {/* Content */}
      {trips.length === 0 ? (
        <Card
          variant="outlined"
          sx={{
            py: 10,
            textAlign: "center",
            borderStyle: "dashed",
            borderWidth: 2,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "primary.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <MapPin size={32} />
          </Box>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            No trips planned yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by creating your first trip itinerary.
          </Typography>
          <Button
            variant="text"
            onClick={openCreateTripModal}
            sx={{ fontWeight: 600 }}
          >
            Create a trip now
          </Button>
        </Card>
      ) : (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          flexWrap="wrap"
          useFlexGap
        >
          {trips.map((trip) => (
            <Box
              key={trip.id}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc(50% - 12px)",
                  lg: "calc(33.333% - 16px)",
                },
              }}
            >
              <Card
                elevation={1}
                sx={{
                  height: "100%",
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(`/trip/${trip.id}`)}>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        trip.coverImage ||
                        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={trip.name}
                      sx={{
                        transition: "transform 0.5s",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                        p: 2,
                        color: "white",
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {trip.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <MapPin size={16} />
                        <Typography variant="body2">
                          {trip.destination}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                        color: "text.secondary",
                      }}
                    >
                      <Calendar size={16} />
                      <Typography variant="body2">
                        {new Date(trip.startDate).toLocaleDateString()} -{" "}
                        {new Date(trip.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {trip.days.length} Days • {trip.tasks.length} Tasks
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary"
                        fontWeight={600}
                      >
                        View Details →
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}
        </Stack>
      )}
    </Container>
  );
};
