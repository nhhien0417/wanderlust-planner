import { useState } from "react";
import { Paper, Grid, TextField, MenuItem, Button } from "@mui/material";
import { Plus } from "lucide-react";

export const CATEGORIES = [
  { id: "Clothing", label: "Clothing" },
  { id: "Toiletries", label: "Toiletries" },
  { id: "Health & Wellness", label: "Health & Wellness" },
  { id: "Electronics", label: "Electronics" },
  { id: "Documents", label: "Documents" },
  { id: "Other", label: "Other" },
];

interface AddItemFormProps {
  onAdd: (name: string, category: string) => void;
}

export const AddItemForm = ({ onAdd }: AddItemFormProps) => {
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Other");

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    onAdd(newItemName, newItemCategory);
    setNewItemName("");
  };

  return (
    <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            placeholder="Add new item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            size="small"
            onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            size="small"
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Plus />}
            onClick={handleAddItem}
          >
            Add
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};
