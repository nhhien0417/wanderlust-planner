import { useState } from "react";
import { Container } from "@mui/material";
import { useTripsStore } from "../../store/useTripsStore";
import { useActivitiesStore } from "../../store/useActivitiesStore";
import { AddActivityModal } from "./components/AddActivityModal";
import { ActivityList } from "./components/activities";

interface TripActivitiesProps {
  tripId: string;
}

export const TripActivities = ({ tripId }: TripActivitiesProps) => {
  const trip = useTripsStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const { addActivity } = useActivitiesStore();
  const [activeDayId, setActiveDayId] = useState<string | null>(null);

  if (!trip) return null;

  const handleAddActivity = (activityData: any) => {
    if (activeDayId) {
      addActivity(trip.id, activeDayId, activityData);
      setActiveDayId(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <ActivityList
        tripId={trip.id}
        onAddActivityClick={(dayId) => setActiveDayId(dayId)}
      />

      <AddActivityModal
        isOpen={!!activeDayId}
        onClose={() => setActiveDayId(null)}
        onAdd={handleAddActivity}
      />
    </Container>
  );
};
