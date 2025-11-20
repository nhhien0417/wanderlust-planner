import { useTripStore } from "../../store/useTripStore";
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  GripVertical,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { AddActivityModal } from "../../components/AddActivityModal";
import { v4 as uuidv4 } from "uuid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
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
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: 280,
          flexShrink: 0,
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
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
          }}
        />
        <Container
          maxWidth="lg"
          sx={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            p: 4,
            color: "white",
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
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

      {/* Itinerary Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 4,
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

      <AddActivityModal
        isOpen={!!activeDayId}
        onClose={() => setActiveDayId(null)}
        onAdd={handleAddActivity}
      />
    </Box>
  );
};
