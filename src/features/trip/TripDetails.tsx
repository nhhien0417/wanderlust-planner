import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Clock, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { SelectChangeEvent } from "@mui/material";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Card,
  Chip,
  Tabs,
  Tab,
  Badge,
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
import { DayWeatherCard } from "../../components/DayWeatherCard";
import {
  ActivityCard,
  SortableActivityItem,
} from "../../components/activities";
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
  const { addActivity, removeActivity, reorderActivities } =
    useActivitiesStore();

  // Photo operations
  const { deletePhoto } = usePhotosStore();

  // Collaboration operations
  const { subscribeToTrip, unsubscribeFromTrip } = useMembersStore();

  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [photoDayFilter, setPhotoDayFilter] = useState("");
  const [photoActivityFilter, setPhotoActivityFilter] = useState("");
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent, dayId: string) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const day = trip.days.find((d) => d.id === dayId);
      if (day) {
        const oldIndex = day.activities.findIndex((a) => a.id === active.id);
        const newIndex = day.activities.findIndex((a) => a.id === over?.id);
        const newActivities = arrayMove(day.activities, oldIndex, newIndex);
        reorderActivities(trip.id, dayId, newActivities);
      }
    }
    setActiveId(null);
  };

  const handleAddActivity = (activityData: any) => {
    if (activeDayId) {
      addActivity(trip.id, activeDayId, activityData);
      setActiveDayId(null);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    // Find which day this activity belongs to
    const day = trip.days.find((d) =>
      d.activities.some((a) => a.id === activityId)
    );
    if (day) {
      removeActivity(trip.id, day.id, activityId);
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
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "white",
          mt: 3,
        }}
      >
        <Container maxWidth="lg">
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            aria-label="trip tabs"
          >
            <Tab label="Itinerary" />
            <Tab label="Board" />
            <Tab label="Budget" />
            <Tab label="Packing List" />
            <Tab
              label={
                <Badge badgeContent={photoCount} color="primary">
                  Photos
                </Badge>
              }
            />
          </Tabs>
        </Container>
      </Box>

      {/* Content */}
      <Box
        sx={{
          py: 4,
          display: currentTab === 0 ? "block" : "none",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {trip.days.map((day, index) => (
              <Box
                key={day.id}
                sx={{
                  display: "flex",
                  gap: 3,
                  alignItems: "flex-start",
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                {/* Day Indicator */}
                <Box
                  sx={{
                    flexShrink: 0,
                    width: { xs: "100%", md: 120 },
                    textAlign: { xs: "left", md: "center" },
                    pt: 1,
                  }}
                >
                  <Chip
                    label={`Day ${index + 1}`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      mb: 1,
                    }}
                  />
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {format(parseISO(day.date), "EEE")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(parseISO(day.date), "MMM d")}
                  </Typography>

                  {/* Day Weather */}
                  <Box sx={{ mt: 1 }}>
                    <DayWeatherCard date={day.date} weather={trip.weather} />
                  </Box>
                </Box>

                {/* Day Content */}
                <Card
                  sx={{
                    flex: 1,
                    p: 3,
                    width: "100%",
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: 6,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Activities
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setActiveDayId(day.id)}
                      sx={{
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      + Add Activity
                    </Button>
                  </Box>

                  {day.activities.length === 0 ? (
                    <Card
                      variant="outlined"
                      sx={{
                        py: 6,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderStyle: "dashed",
                        borderWidth: 2,
                        borderColor: "divider",
                        backgroundColor: "grey.50",
                      }}
                    >
                      <Clock size={32} opacity={0.3} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        No activities planned yet
                      </Typography>
                    </Card>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={(e) => handleDragEnd(e, day.id)}
                      modifiers={[]} // Removed restrictToVerticalAxis to allow free movement if needed, or keep it
                    >
                      <SortableContext
                        items={day.activities.map((a) => a.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {day.activities.map((activity) => (
                            <SortableActivityItem
                              key={activity.id}
                              activity={activity}
                              onDelete={handleDeleteActivity}
                            />
                          ))}
                        </Box>
                      </SortableContext>
                      <DragOverlay dropAnimation={null}>
                        {activeId ? (
                          <ActivityCard
                            activity={
                              day.activities.find((a) => a.id === activeId)!
                            }
                            isDragging
                            isOverlay
                          />
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  )}
                </Card>
              </Box>
            ))}
          </Box>
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
