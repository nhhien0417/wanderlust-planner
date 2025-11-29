import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActivityCard } from "./ActivityCard";
import type { Activity } from "../../../../types";

interface SortableActivityItemProps {
  activity: Activity;
  onDelete?: (id: string) => void;
  disabled?: boolean;
}

export const SortableActivityItem = ({
  activity,
  onDelete,
  disabled,
}: SortableActivityItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ActivityCard
        activity={activity}
        isDragging={isDragging}
        onDelete={onDelete}
        showDragHandle={!disabled}
      />
    </div>
  );
};
