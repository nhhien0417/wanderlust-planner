import { useState, useMemo } from "react";
import { useTripStore } from "../../store/useTripStore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";

interface TripBudgetProps {
  tripId: string;
}

const CATEGORIES = [
  { id: "accommodation", label: "Accommodation", color: "#8884d8" },
  { id: "food", label: "Food & Dining", color: "#82ca9d" },
  { id: "transportation", label: "Transportation", color: "#ffc658" },
  { id: "activities", label: "Activities", color: "#ff8042" },
  { id: "shopping", label: "Shopping", color: "#0088fe" },
  { id: "other", label: "Other", color: "#00C49F" },
];

export const TripBudget = ({ tripId }: TripBudgetProps) => {
  const trip = useTripStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const addExpense = useTripStore((state) => state.addExpense);
  const removeExpense = useTripStore((state) => state.removeExpense);
  const updateExpense = useTripStore((state) => state.updateExpense);
  const setBudget = useTripStore((state) => state.setBudget);

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

  const remainingBudget = trip.budget - totalSpent;

  const chartData = useMemo(() => {
    const data = CATEGORIES.map((cat) => ({
      name: cat.label,
      value: trip.expenses
        .filter((e) => e.category === cat.id)
        .reduce((acc, curr) => acc + curr.amount, 0),
      color: cat.color,
    })).filter((d) => d.value > 0);
    return data;
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

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              borderRadius: 2,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                Total Budget
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  ${trip.budget.toLocaleString()}
                </Typography>
                <IconButton
                  size="small"
                  sx={{ color: "white", opacity: 0.8 }}
                  onClick={() => {
                    setNewBudget(trip.budget.toString());
                    setIsEditBudgetOpen(true);
                  }}
                >
                  <Edit2 size={16} />
                </IconButton>
              </Box>
            </Box>
            <Wallet
              size={100}
              style={{
                position: "absolute",
                right: -20,
                bottom: -20,
                opacity: 0.1,
              }}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              borderRadius: 2,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                Remaining
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${remainingBudget.toLocaleString()}
              </Typography>
            </Box>
            <DollarSign
              size={100}
              style={{
                position: "absolute",
                right: -20,
                bottom: -20,
                opacity: 0.1,
              }}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "white",
              borderRadius: 2,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                Total Spent
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${totalSpent.toLocaleString()}
              </Typography>
            </Box>
            <TrendingUp
              size={100}
              style={{
                position: "absolute",
                right: -20,
                bottom: -20,
                opacity: 0.1,
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Expense List */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Expenses
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trip.expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No expenses recorded yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    trip.expenses.map((expense) => (
                      <TableRow key={expense.id} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor:
                                  CATEGORIES.find(
                                    (c) => c.id === expense.category
                                  )?.color || "grey.500",
                              }}
                            />
                            {CATEGORIES.find((c) => c.id === expense.category)
                              ?.label || expense.category}
                          </Box>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>{expense.date || "-"}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          ${expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <Edit2 size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeExpense(tripId, expense.id)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Spending Breakdown
            </Typography>
            <Box sx={{ height: 300, width: "100%" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Expense Modal */}
      <Dialog
        open={isAddModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingExpense ? "Edit Expense" : "Add New Expense"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              select
              label="Category"
              fullWidth
              value={expenseData.category}
              onChange={(e) =>
                setExpenseData({ ...expenseData, category: e.target.value })
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
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              value={expenseData.amount}
              onChange={(e) =>
                setExpenseData({ ...expenseData, amount: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              value={expenseData.description}
              onChange={(e) =>
                setExpenseData({ ...expenseData, description: e.target.value })
              }
            />
            <TextField
              type="date"
              label="Date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={expenseData.date}
              onChange={(e) =>
                setExpenseData({ ...expenseData, date: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveExpense} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
                <InputAdornment position="start">$</InputAdornment>
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
