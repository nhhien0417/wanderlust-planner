import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { getCurrencySymbol } from "../../utils/currency";
import { CATEGORIES } from "./ExpenseList";

export interface ExpenseFormData {
  category: string;
  amount: string;
  description: string;
  date: string;
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: ExpenseFormData;
  onChange: (data: ExpenseFormData) => void;
  isEditing: boolean;
  currency: string;
}

export const ExpenseModal = ({
  isOpen,
  onClose,
  onSave,
  formData,
  onChange,
  isEditing,
  currency,
}: ExpenseModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? "Edit Expense" : "Add New Expense"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            select
            label="Category"
            fullWidth
            value={formData.category}
            onChange={(e) =>
              onChange({ ...formData, category: e.target.value })
            }
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {getCurrencySymbol(currency)}
                </InputAdornment>
              ),
              inputProps: {
                min: 0,
              },
            }}
            value={formData.amount}
            onChange={(e) => onChange({ ...formData, amount: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            value={formData.description}
            onChange={(e) =>
              onChange({ ...formData, description: e.target.value })
            }
          />
          <TextField
            type="date"
            label="Date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.date}
            onChange={(e) => onChange({ ...formData, date: e.target.value })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
