import { useState } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Typography, Button, Card, Chip } from "@mui/material";
import { Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTripsStore } from "../../../../store/useTripsStore";
import { useActivitiesStore } from "../../../../store/useActivitiesStore";
import { ActivityCard } from "./ActivityCard";
import { SortableActivityItem } from "./SortableActivityItem";
import { DayWeatherCard } from "../../../weather/components/DayWeatherCard";

interface ActivityListProps {
  tripId: string;
  onAddActivityClick: (dayId: string) => void;
}

export const ActivityList = ({
  tripId,
  onAddActivityClick,
}: ActivityListProps) => {
  const trip = useTripsStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const { reorderActivities, removeActivity } = useActivitiesStore();

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!trip) return null;

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

  const handleDeleteActivity = (dayId: string, activityId: string) => {
    removeActivity(trip.id, dayId, activityId);
  };

  return (
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
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                mb: 1,
              }}
            />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
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
                onClick={() => onAddActivityClick(day.id)}
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
                modifiers={[]}
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
                        onDelete={(id) => handleDeleteActivity(day.id, id)}
                      />
                    ))}
                  </Box>
                </SortableContext>
                <DragOverlay dropAnimation={null}>
                  {activeId ? (
                    <ActivityCard
                      activity={day.activities.find((a) => a.id === activeId)!}
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
  );
};
