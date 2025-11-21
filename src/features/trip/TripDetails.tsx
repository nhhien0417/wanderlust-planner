import { useTripStore } from "../../store/useTripStore";
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  GripVertical,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { AddActivityModal } from "../../components/AddActivityModal";
import { v4 as uuidv4 } from "uuid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { TripKanban } from "./TripKanban";
import { TripBudget } from "./TripBudget";
import { TripPackingList } from "./TripPackingList";
import { WeatherWidget } from "./WeatherWidget";
import { DayWeatherCard } from "./DayWeatherCard";
import { PhotoUpload } from "../gallery/PhotoUpload";
import { PhotoGallery } from "../gallery/PhotoGallery";
import { PhotoLightbox } from "../gallery/PhotoLightbox";
import { PhotoMetadataForm } from "../gallery/PhotoMetadataForm";
import type { Photo } from "../../types";

const EMPTY_PHOTOS: Photo[] = [];

interface TripDetailsProps {
  tripId: string;
}

// Sortable Activity Card Component
const SortableActivityCard = ({ activity }: { activity: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{
        p: 2,
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        backgroundColor: isDragging ? "primary.50" : "grey.50",
        border: "1px solid",
        borderColor: isDragging ? "primary.main" : "divider",
        transition: "all 0.2s",
        cursor: isDragging ? "grabbing" : "grab",
        "&:hover": {
          backgroundColor: "white",
          borderColor: "primary.main",
          boxShadow: 2,
        },
      }}
    >
      {/* Drag Handle */}
      <IconButton
        {...attributes}
        {...listeners}
        size="small"
        sx={{
          cursor: "grab",
          color: "text.secondary",
          "&:active": {
            cursor: "grabbing",
          },
          "&:hover": {
            backgroundColor: "primary.50",
            color: "primary.main",
          },
        }}
      >
        <GripVertical size={20} />
      </IconButton>

      <Box
        sx={{
          p: 1.5,
          backgroundColor: "white",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MapPin size={20} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {activity.location.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {activity.location.address}
        </Typography>
      </Box>
    </Card>
  );
};

export const TripDetails = ({ tripId }: TripDetailsProps) => {
  const trip = useTripStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const addActivity = useTripStore((state) => state.addActivity);
  const reorderActivities = useTripStore((state) => state.reorderActivities);
  const fetchTripWeather = useTripStore((state) => state.fetchTripWeather);
  const deletePhoto = useTripStore((state) => state.deletePhoto);
  const tripPhotos = useTripStore((state) => {
    const found = state.trips.find((t) => t.id === tripId);
    return found?.photos ?? EMPTY_PHOTOS;
  });
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [photoDayFilter, setPhotoDayFilter] = useState("");
  const [photoActivityFilter, setPhotoActivityFilter] = useState("");

  // Fetch weather data when trip loads
  useEffect(() => {
    if (trip && !trip.weather) {
      fetchTripWeather(tripId);
    }
  }, [tripId, trip?.weather, fetchTripWeather]);

  const filteredPhotos = useMemo(() => {
    return tripPhotos.filter((photo) => {
      if (photoDayFilter && photo.dayId !== photoDayFilter) return false;
      if (photoActivityFilter && photo.activityId !== photoActivityFilter)
        return false;
      return true;
    });
  }, [tripPhotos, photoActivityFilter, photoDayFilter]);

  const selectedDay = useMemo(
    () => trip?.days.find((d) => d.id === photoDayFilter),
    [photoDayFilter, trip?.days]
  );

  const activitiesForFilter = selectedDay?.activities ?? [];

  useEffect(() => {
    if (!photoActivityFilter) return;

    const stillValid = activitiesForFilter.some(
      (activity) => activity.id === photoActivityFilter
    );

    if (!stillValid) {
      setPhotoActivityFilter("");
    }
  }, [activitiesForFilter, photoActivityFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!trip) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Trip not found
        </Typography>
      </Box>
    );
  }

  const handleAddActivity = (location: {
    name: string;
    lat: number;
    lng: number;
    address: string;
  }) => {
    if (activeDayId) {
      addActivity(tripId, activeDayId, {
        id: uuidv4(),
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        type: "other",
      });
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent, dayId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const day = trip.days.find((d) => d.id === dayId);
      if (!day) return;

      const oldIndex = day.activities.findIndex((a) => a.id === active.id);
      const newIndex = day.activities.findIndex((a) => a.id === over.id);

      const newActivities = arrayMove(day.activities, oldIndex, newIndex);
      reorderActivities(tripId, dayId, newActivities);
    }

    setActiveId(null);
  };

  const handlePhotoClick = (_photo: Photo, index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handlePhotoDelete = async (photoId: string) => {
    await deletePhoto(tripId, photoId);
  };

  const handlePhotoEdit = (photo: Photo) => {
    setEditingPhoto(photo);
  };

  const photoCount = tripPhotos.length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={
            trip.coverImage ||
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"
          }
          alt={trip.name}
          sx={{
            width: "100%",
            height: 180,
            objectFit: "cover",
          }}
        />
      </Box>

      {/* Trip Info */}
      <Box sx={{ bgcolor: "grey.900", color: "white", py: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
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
              <MapPin size={18} />
              <Typography variant="body1" fontWeight={500}>
                {trip.destination}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Calendar size={18} />
              <Typography variant="body1" fontWeight={500}>
                {format(parseISO(trip.startDate), "MMM d")} -{" "}
                {format(parseISO(trip.endDate), "MMM d, yyyy")}
              </Typography>
            </Box>
            {trip.budget > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DollarSign size={18} />
                <Typography variant="body1" fontWeight={500}>
                  Budget: ${trip.budget.toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <WeatherWidget tripId={tripId} />
      </Container>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            aria-label="trip tabs"
          >
            <Tab label="Itinerary" />
            <Tab label="Kanban Board" />
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
            {trip.days.map((day: any, index: number) => (
              <Box
                key={day.id}
                sx={{
                  display: "flex",
                  gap: 3,
                  alignItems: "flex-start",
                }}
              >
                {/* Day Indicator */}
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 100,
                    textAlign: "center",
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
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-2px)",
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
                      {day.activities.length > 0 && (
                        <Chip
                          label={`Drag to reorder`}
                          size="small"
                          sx={{ ml: 2, fontSize: "0.75rem" }}
                        />
                      )}
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
                    >
                      <SortableContext
                        items={day.activities.map((a: any) => a.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {day.activities.map((activity: any) => (
                            <SortableActivityCard
                              key={activity.id}
                              activity={activity}
                            />
                          ))}
                        </Box>
                      </SortableContext>
                      <DragOverlay>
                        {activeId ? (
                          <SortableActivityCard
                            activity={day.activities.find(
                              (a: any) => a.id === activeId
                            )}
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
          <TripKanban tripId={tripId} />
        </Box>
      )}

      {/* Budget Content */}
      {currentTab === 2 && (
        <Box sx={{ py: 4 }}>
          <TripBudget tripId={tripId} />
        </Box>
      )}

      {/* Packing List Content */}
      {currentTab === 3 && (
        <Box sx={{ py: 4 }}>
          <TripPackingList tripId={tripId} />
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
                  tripId={tripId}
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
                              {activity.location.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <PhotoGallery
                    tripId={tripId}
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
          tripId={tripId}
          photo={editingPhoto}
          open={Boolean(editingPhoto)}
          onClose={() => setEditingPhoto(null)}
        />
      )}

      <AddActivityModal
        isOpen={!!activeDayId}
        onClose={() => setActiveDayId(null)}
        onAdd={handleAddActivity}
      />
    </Box>
  );
};
