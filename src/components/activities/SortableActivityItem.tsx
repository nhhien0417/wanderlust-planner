import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActivityCard } from "./ActivityCard";
import type { Activity } from "../../types";

interface SortableActivityItemProps {
  activity: Activity;
  onDelete?: (id: string) => void;
}

export const SortableActivityItem = ({
  activity,
  onDelete,
}: SortableActivityItemProps) => {
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
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ActivityCard
        activity={activity}
        isDragging={isDragging}
        onDelete={onDelete}
        showDragHandle={true}
      />
    </div>
  );
};
