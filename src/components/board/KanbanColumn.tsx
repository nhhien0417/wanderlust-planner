import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Typography, Chip } from "@mui/material";
import type { TripTask, TaskStatus } from "../../types";
import { SortableTaskCard } from "./SortableTaskCard";

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string; color: string };
  tasks: TripTask[];
  onEditTask: (task: TripTask) => void;
}

export const KanbanColumn = ({
  column,
  tasks,
  onEditTask,
}: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: "grey.100",
        borderRadius: 2,
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {column.title}
        </Typography>
        <Chip
          label={tasks.length}
          size="small"
          sx={{ backgroundColor: "white", fontWeight: "bold" }}
        />
      </Box>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <Box
          ref={setNodeRef}
          sx={{ flex: 1, overflowY: "auto", minHeight: 100 }}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onEditTask(task)}
            />
          ))}
        </Box>
      </SortableContext>
    </Box>
  );
};
