import { Box, Paper, Typography, IconButton, Grid } from "@mui/material";
import { Wallet, Edit2, DollarSign, TrendingUp, Calendar } from "lucide-react";
import type { Expense } from "../../../../types";
import { formatCurrency } from "../../../../utils/currency";

interface BudgetOverviewProps {
  budget: number;
  expenses: Expense[];
  currency: string;
  onEditBudget: () => void;
  readonly?: boolean;
}

export const BudgetOverview = ({
  budget,
  expenses,
  currency,
  onEditBudget,
  readonly,
}: BudgetOverviewProps) => {
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = budget - totalSpent;
  const isOverBudget = totalSpent > budget;

  const activeSpendingDays = Math.max(
    new Set(expenses.map((e) => e.date?.split("T")[0] || "unknown")).size,
    1
  );
  const dailyAverage = totalSpent / activeSpendingDays;

  return (
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
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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
            {!readonly && (
              <IconButton size="small" onClick={onEditBudget}>
                <Edit2 size={16} />
              </IconButton>
            )}
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {formatCurrency(budget, currency)}
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
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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
              {formatCurrency(Math.abs(remainingBudget), currency)}
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
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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
              {formatCurrency(totalSpent, currency)}
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
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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
              {formatCurrency(Math.round(dailyAverage), currency)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Daily Average
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
