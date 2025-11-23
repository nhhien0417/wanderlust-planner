import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Typography, Box, Chip } from "@mui/material";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { TripTask } from "../../../../types";

interface SortableTaskCardProps {
  task: TripTask;
  onClick: () => void;
}

export const SortableTaskCard = ({ task, onClick }: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "Task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        p: 2,
        mb: 2,
        cursor: "grab",
        "&:hover": { boxShadow: 3 },
        borderLeft: `4px solid ${
          task.priority === "high"
            ? "#ef4444"
            : task.priority === "medium"
            ? "#f59e0b"
            : "#3b82f6"
        }`,
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {task.title}
      </Typography>
      {task.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {task.description}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        {task.dueDate && (
          <Chip
            icon={<CalendarIcon size={14} />}
            label={format(parseISO(task.dueDate), "MMM d")}
            size="small"
            variant="outlined"
          />
        )}
        <Chip
          label={task.priority}
          size="small"
          color={
            task.priority === "high"
              ? "error"
              : task.priority === "medium"
              ? "warning"
              : "primary"
          }
          variant="outlined"
          sx={{ textTransform: "capitalize" }}
        />
      </Box>
    </Card>
  );
};
