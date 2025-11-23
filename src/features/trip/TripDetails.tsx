import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { X } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { SelectChangeEvent } from "@mui/material";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Card,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTripsStore } from "../../store/useTripsStore";
import { useActivitiesStore } from "../../store/useActivitiesStore";
import { usePhotosStore } from "../../store/usePhotosStore";
import { useMembersStore } from "../../store/useMembersStore";
import { ShareModal } from "../../components/ShareModal";
import { AddActivityModal } from "../../components/AddActivityModal";
import { ActivityList } from "../../components/activities";
import { TripBoard } from "./TripBoard";
import { TripBudget } from "./TripBudget";
import { TripPackingList } from "./TripPackingList";
import { PhotoGallery } from "../gallery/PhotoGallery";
import { PhotoUpload } from "../gallery/PhotoUpload";
import { PhotoLightbox } from "../gallery/PhotoLightbox";
import { PhotoMetadataForm } from "../gallery/PhotoMetadataForm";
import { WeatherWidget } from "../weather/WeatherWidget";
import type { Photo } from "../../types";
import { TripHeader } from "./TripHeader";
import { TripTabs } from "./TripTabs";

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
  const tripPhotos = useTripsStore((state) => {
    const found = state.trips.find((t) => t.id === tripId);
    return found?.photos ?? EMPTY_PHOTOS;
  });

  // Activity operations
  const { addActivity } = useActivitiesStore();

  // Photo operations
  const { deletePhoto } = usePhotosStore();

  // Collaboration operations
  const { subscribeToTrip, unsubscribeFromTrip } = useMembersStore();

  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [photoDayFilter, setPhotoDayFilter] = useState("");
  const [photoActivityFilter, setPhotoActivityFilter] = useState("");
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Real-time subscription
  useEffect(() => {
    if (tripId) {
      subscribeToTrip(tripId);
      return () => unsubscribeFromTrip(tripId);
    }
  }, [tripId, subscribeToTrip, unsubscribeFromTrip]);

  if (!trip) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">Trip not found</Typography>
      </Box>
    );
  }

  const handleAddActivity = (activityData: any) => {
    if (activeDayId) {
      addActivity(trip.id, activeDayId, activityData);
      setActiveDayId(null);
    }
  };

  // Photo Logic
  const filteredPhotos = tripPhotos.filter((photo) => {
    if (photoDayFilter && photo.dayId !== photoDayFilter) return false;
    if (photoActivityFilter && photo.activityId !== photoActivityFilter)
      return false;
    return true;
  });

  const handlePhotoClick = (photo: Photo) => {
    const index = filteredPhotos.findIndex((p) => p.id === photo.id);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handlePhotoDelete = async (photoId: string) => {
    await deletePhoto(trip.id, photoId);
    if (filteredPhotos.length <= 1) {
      setLightboxOpen(false);
    }
  };

  const handlePhotoEdit = (photo: Photo) => {
    setEditingPhoto(photo);
  };

  const selectedDay = trip.days.find((d) => d.id === photoDayFilter);
  const activitiesForFilter = selectedDay ? selectedDay.activities : [];
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
        onShare={() => setIsShareModalOpen(true)}
        onChangeCover={() => setShowCoverModal(true)}
      />

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <WeatherWidget tripId={trip.id} />
      </Container>

      {/* Tabs */}
      {/* Tabs */}
      <TripTabs
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        photoCount={photoCount}
      />

      {/* Content */}
      <Box
        sx={{
          py: 4,
          display: currentTab === 0 ? "block" : "none",
        }}
      >
        <Container maxWidth="lg">
          <ActivityList
            tripId={trip.id}
            onAddActivityClick={(dayId) => setActiveDayId(dayId)}
          />
        </Container>
      </Box>

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
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
                gap: 3,
              }}
            >
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Upload Photos
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Attach uploads to a day or activity to keep memories
                  organized.
                </Typography>
                <PhotoUpload
                  tripId={trip.id}
                  dayId={photoDayFilter || undefined}
                  activityId={photoActivityFilter || undefined}
                />
              </Card>

              <Card sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Gallery ({filteredPhotos.length})
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel id="day-filter-label">Day</InputLabel>
                      <Select
                        labelId="day-filter-label"
                        label="Day"
                        value={photoDayFilter}
                        onChange={(event: SelectChangeEvent<string>) => {
                          setPhotoDayFilter(event.target.value);
                          if (!event.target.value) {
                            setPhotoActivityFilter("");
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>All days</em>
                        </MenuItem>
                        {trip.days.map((day, index) => (
                          <MenuItem key={day.id} value={day.id}>
                            Day {index + 1} -{" "}
                            {format(parseISO(day.date), "MMM d")}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedDay && (
                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel id="activity-filter-label">
                          Activity
                        </InputLabel>
                        <Select
                          labelId="activity-filter-label"
                          label="Activity"
                          value={photoActivityFilter}
                          onChange={(event: SelectChangeEvent<string>) =>
                            setPhotoActivityFilter(event.target.value)
                          }
                        >
                          <MenuItem value="">
                            <em>All activities</em>
                          </MenuItem>
                          {activitiesForFilter.map((activity) => (
                            <MenuItem key={activity.id} value={activity.id}>
                              {activity.location?.name || activity.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <PhotoGallery
                    tripId={trip.id}
                    photos={filteredPhotos}
                    onPhotoClick={handlePhotoClick}
                    onEditPhoto={handlePhotoEdit}
                  />
                </Box>
              </Card>
            </Box>
          </Container>
        </Box>
      )}

      <PhotoLightbox
        photos={filteredPhotos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onDelete={handlePhotoDelete}
        onEdit={handlePhotoEdit}
      />

      {editingPhoto && (
        <PhotoMetadataForm
          tripId={trip.id}
          photo={editingPhoto}
          open={Boolean(editingPhoto)}
          onClose={() => setEditingPhoto(null)}
        />
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

      <AddActivityModal
        isOpen={!!activeDayId}
        onClose={() => setActiveDayId(null)}
        onAdd={handleAddActivity}
      />

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
