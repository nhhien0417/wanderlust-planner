import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { X } from "lucide-react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import { useTripsStore } from "../../store/useTripsStore";
import { useMembersStore } from "../../store/useMembersStore";
import { ShareModal } from "./components/ShareModal";
import { TripBoard } from "./TripBoard";
import { TripBudget } from "./TripBudget";
import { TripPackingList } from "./TripPackingList";
import { TripGallery } from "./TripGallery";
import { TripWeather } from "./TripWeather";
import { TripActivities } from "./TripActivities";
import { TripHeader } from "./TripHeader";
import { TripTabs } from "./TripTabs";
import type { Photo } from "../../types";

const EMPTY_PHOTOS: Photo[] = [];

interface TripDetailsProps {
  tripId?: string;
}

// --- Main Component ---

export const TripDetails = ({ tripId: propTripId }: TripDetailsProps) => {
  const { tripId: paramTripId } = useParams<{ tripId: string }>();
  const tripId = propTripId || paramTripId;

  // Use specialized stores
  const trip = useTripsStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const setActiveTrip = useTripsStore((state) => state.setActiveTrip);
  const isLoading = useTripsStore((state) => state.isLoading);
  const tripPhotos = useTripsStore((state) => {
    const found = state.trips.find((t) => t.id === tripId);
    return found?.photos ?? EMPTY_PHOTOS;
  });

  // Collaboration operations
  const { subscribeToTrip, unsubscribeFromTrip } = useMembersStore();

  const [currentTab, setCurrentTab] = useState(0);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Real-time subscription
  useEffect(() => {
    if (tripId) {
      setActiveTrip(tripId);
      subscribeToTrip(tripId);
      return () => unsubscribeFromTrip(tripId);
    }
  }, [tripId, subscribeToTrip, unsubscribeFromTrip, setActiveTrip]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">Trip not found</Typography>
      </Box>
    );
  }

  const photoCount = tripPhotos.length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      {/* Hero Section */}
      <TripHeader
        trip={trip}
        onShareClick={() => setIsShareModalOpen(true)}
        onCoverClick={() => setShowCoverModal(true)}
      />

      {/* Tabs */}
      <TripTabs
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        photoCount={photoCount}
      />

      {/* Content */}
      {currentTab === 0 && (
        <Box sx={{ py: 4 }}>
          <TripActivities tripId={trip.id} />
        </Box>
      )}

      {/* Kanban Content */}
      {currentTab === 1 && (
        <Box sx={{ py: 4 }}>
          <TripBoard tripId={trip.id} />
        </Box>
      )}

      {/* Budget Content */}
      {currentTab === 2 && (
        <Box sx={{ py: 4 }}>
          <TripBudget tripId={trip.id} />
        </Box>
      )}

      {/* Packing List Content */}
      {currentTab === 3 && (
        <Box sx={{ py: 4 }}>
          <TripPackingList tripId={trip.id} />
        </Box>
      )}

      {/* Photos Content */}
      {currentTab === 4 && (
        <Box sx={{ py: 4 }}>
          <TripWeather tripId={trip.id} />
        </Box>
      )}

      {/* Weather Content */}
      {currentTab === 5 && (
        <Box sx={{ py: 4 }}>
          <TripGallery tripId={trip.id} />
        </Box>
      )}

      {/* Cover Photo Modal */}
      <Dialog
        open={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <IconButton
            onClick={() => setShowCoverModal(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.6)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.8)",
              },
              zIndex: 1,
            }}
          >
            <X size={24} />
          </IconButton>
          <Box
            component="img"
            src={
              trip.coverImage ||
              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"
            }
            alt={trip.name}
            sx={{
              width: "100%",
              display: "block",
            }}
          />
        </DialogContent>
      </Dialog>

      {tripId && (
        <ShareModal
          open={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          tripId={tripId}
        />
      )}
    </Box>
  );
};
