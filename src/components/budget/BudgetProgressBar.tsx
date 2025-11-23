import { Box, Paper, Typography, LinearProgress } from "@mui/material";

interface BudgetProgressBarProps {
  totalSpent: number;
  budget: number;
}

export const BudgetProgressBar = ({
  totalSpent,
  budget,
}: BudgetProgressBarProps) => {
  const budgetProgress = Math.min((totalSpent / budget) * 100, 100);
  const isOverBudget = totalSpent > budget;

  return (
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
          {Math.round((totalSpent / budget) * 100)}% Used
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
  );
};
