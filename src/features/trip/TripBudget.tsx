import { useState, useMemo } from "react";
import { useTripsStore } from "../../store/useTripsStore";
import { useBudgetStore } from "../../store/useBudgetStore";
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
import LinearProgress from "@mui/material/LinearProgress";
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
  Calendar,
} from "lucide-react";
import { formatCurrency, getCurrencySymbol } from "../../utils/currency";

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

  const activeSpendingDays = useMemo(() => {
    const uniqueDates = new Set(
      trip.expenses.map((e) => e.date?.split("T")[0] || "unknown")
    );
    // Filter out any potential invalid dates if necessary, but for now just count unique strings
    return uniqueDates.size || 1;
  }, [trip.expenses]);

  const dailyAverage = totalSpent / activeSpendingDays;
  const budgetProgress = Math.min((totalSpent / trip.budget) * 100, 100);
  const isOverBudget = totalSpent > trip.budget;

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

      {/* Budget Progress */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Budget Usage
          </Typography>
          <Typography
            variant="body2"
            color={isOverBudget ? "error.main" : "text.secondary"}
            fontWeight="bold"
          >
            {Math.round((totalSpent / trip.budget) * 100)}% Used
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={budgetProgress}
          color={isOverBudget ? "error" : "primary"}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: "grey.100",
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
            },
          }}
        />
      </Paper>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: "primary.50",
                  color: "primary.main",
                }}
              >
                <Wallet size={20} />
              </Box>
              <IconButton
                size="small"
                onClick={() => {
                  setNewBudget(trip.budget.toString());
                  setIsEditBudgetOpen(true);
                }}
              >
                <Edit2 size={16} />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(trip.budget, trip.currency)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Budget
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              bgcolor: isOverBudget ? "error.50" : "success.50",
              borderColor: isOverBudget ? "error.200" : "success.200",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: isOverBudget ? "error.100" : "success.100",
                  color: isOverBudget ? "error.700" : "success.700",
                }}
              >
                <DollarSign size={20} />
              </Box>
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={isOverBudget ? "error.700" : "success.700"}
              >
                {formatCurrency(Math.abs(remainingBudget), trip.currency)}
              </Typography>
              <Typography
                variant="body2"
                color={isOverBudget ? "error.600" : "success.600"}
              >
                {isOverBudget ? "Over Budget" : "Remaining"}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: "warning.50",
                  color: "warning.main",
                }}
              >
                <TrendingUp size={20} />
              </Box>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(totalSpent, trip.currency)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Spent
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: "info.50",
                  color: "info.main",
                }}
              >
                <Calendar size={20} />
              </Box>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(Math.round(dailyAverage), trip.currency)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily Average
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Expense List */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Expenses
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 750 }}>
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
                          {formatCurrency(expense.amount, trip.currency)}
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

        {/* Chart and Analysis */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Spending Breakdown
            </Typography>
            <Box sx={{ height: 250, width: "100%", mb: 3 }}>
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
                  <RechartsTooltip
                    formatter={(value: number) =>
                      formatCurrency(value, trip.currency)
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {chartData.map((data) => (
                <Box
                  key={data.name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: 1,
                        bgcolor: data.color,
                      }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      {data.name}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(data.value, trip.currency)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((data.value / totalSpent) * 100)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
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
                  <InputAdornment position="start">
                    {getCurrencySymbol(trip.currency)}
                  </InputAdornment>
                ),
                inputProps: {
                  min: 0,
                },
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
