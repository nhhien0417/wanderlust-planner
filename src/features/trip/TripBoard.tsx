import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useTripsStore } from "../../store/useTripsStore";
import { useTasksStore } from "../../store/useTasksStore";
import type { TripTask, TaskStatus } from "../../types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { Plus } from "lucide-react";
import { KanbanColumn, SortableTaskCard } from "./components/board";

interface TripKanbanProps {
  tripId: string;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "#e2e8f0" },
  { id: "in-progress", title: "In Progress", color: "#bfdbfe" },
  { id: "done", title: "Done", color: "#bbf7d0" },
];

export const TripBoard = ({ tripId }: TripKanbanProps) => {
  const trip = useTripsStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const { addTask, updateTask, updateTaskStatus } = useTasksStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TripTask | null>(null);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    status: "todo" as TaskStatus,
  });

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

  if (!trip) return null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      const activeTask = trip.tasks.find((t) => t.id === activeId);
      const overTask = trip.tasks.find((t) => t.id === overId);

      if (activeTask && overTask && activeTask.status !== overTask.status) {
        updateTaskStatus(tripId, activeId as string, overTask.status);
      }
    }

    // Dropping a Task over a Column
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    if (isActiveTask && isOverColumn) {
      const activeTask = trip.tasks.find((t) => t.id === activeId);
      if (activeTask && activeTask.status !== overId) {
        updateTaskStatus(tripId, activeId as string, overId as TaskStatus);
      }
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  const handleSaveTask = () => {
    if (!newTaskData.title) return;

    if (editingTask) {
      updateTask(tripId, editingTask.id, {
        title: newTaskData.title,
        description: newTaskData.description,
        priority: newTaskData.priority,
        status: newTaskData.status,
        dueDate: newTaskData.dueDate || undefined,
      });
    } else {
      addTask(tripId, {
        title: newTaskData.title,
        description: newTaskData.description,
        priority: newTaskData.priority,
        status: newTaskData.status,
        dueDate: newTaskData.dueDate || undefined,
      });
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setNewTaskData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      status: "todo",
    });
  };

  return (
    <Box sx={{ height: "100%", overflowX: "auto", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Trip Board
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setIsModalOpen(true)}
        >
          New Task
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            height: "calc(100% - 80px)",
            minWidth: 900,
          }}
        >
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={trip.tasks.filter((t) => t.status === column.id)}
              onEditTask={(task) => {
                setEditingTask(task);
                setNewTaskData({
                  title: task.title,
                  description: task.description || "",
                  priority: task.priority,
                  dueDate: task.dueDate || "",
                  status: task.status,
                });
                setIsModalOpen(true);
              }}
            />
          ))}
        </Box>

        <DragOverlay>
          {activeId ? (
            <SortableTaskCard
              task={trip.tasks.find((t) => t.id === activeId)!}
              onClick={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={newTaskData.title}
              onChange={(e) =>
                setNewTaskData({ ...newTaskData, title: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newTaskData.description}
              onChange={(e) =>
                setNewTaskData({ ...newTaskData, description: e.target.value })
              }
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select
                label="Priority"
                fullWidth
                value={newTaskData.priority}
                onChange={(e) =>
                  setNewTaskData({
                    ...newTaskData,
                    priority: e.target.value as any,
                  })
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
              <TextField
                type="date"
                label="Due Date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newTaskData.dueDate}
                onChange={(e) =>
                  setNewTaskData({ ...newTaskData, dueDate: e.target.value })
                }
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
