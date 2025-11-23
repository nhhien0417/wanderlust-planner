import { useState, useMemo } from "react";
import { useTripsStore } from "../../store/useTripsStore";
import { useBudgetStore } from "../../store/useBudgetStore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Plus } from "lucide-react";
import { getCurrencySymbol } from "../../utils/currency";
import {
  BudgetOverview,
  BudgetProgressBar,
  ExpenseList,
  BudgetChart,
  ExpenseModal,
} from "./components/budget";

interface TripBudgetProps {
  tripId: string;
}

export const TripBudget = ({ tripId }: TripBudgetProps) => {
  const trip = useTripsStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const { addExpense, removeExpense, updateExpense, setBudget } =
    useBudgetStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState("");

  const [expenseData, setExpenseData] = useState({
    category: "food",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  if (!trip) return null;

  const totalSpent = useMemo(() => {
    return trip.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [trip.expenses]);

  const handleSaveExpense = () => {
    if (!expenseData.amount) return;

    const amount = parseFloat(expenseData.amount);

    if (editingExpense) {
      updateExpense(tripId, editingExpense, {
        ...expenseData,
        amount,
      });
    } else {
      addExpense(tripId, {
        ...expenseData,
        amount,
      });
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingExpense(null);
    setExpenseData({
      category: "food",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense.id);
    setExpenseData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date || new Date().toISOString().split("T")[0],
    });
    setIsAddModalOpen(true);
  };

  const handleUpdateBudget = () => {
    if (newBudget) {
      setBudget(tripId, parseFloat(newBudget));
      setIsEditBudgetOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3, height: "100%", overflowY: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Budget Tracker
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Expense
        </Button>
      </Box>

      <BudgetProgressBar totalSpent={totalSpent} budget={trip.budget} />

      <BudgetOverview
        budget={trip.budget}
        expenses={trip.expenses}
        currency={trip.currency || "USD"}
        onEditBudget={() => {
          setNewBudget(trip.budget.toString());
          setIsEditBudgetOpen(true);
        }}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ExpenseList
            expenses={trip.expenses}
            currency={trip.currency || "USD"}
            onEdit={handleEditExpense}
            onDelete={(id) => removeExpense(tripId, id)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <BudgetChart
            expenses={trip.expenses}
            currency={trip.currency || "USD"}
          />
        </Grid>
      </Grid>

      <ExpenseModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
        formData={expenseData}
        onChange={setExpenseData}
        isEditing={!!editingExpense}
        currency={trip.currency || "USD"}
      />

      {/* Edit Budget Modal */}
      <Dialog
        open={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Set Trip Budget</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Budget Amount"
            type="number"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {getCurrencySymbol(trip.currency)}
                </InputAdornment>
              ),
            }}
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditBudgetOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateBudget} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
