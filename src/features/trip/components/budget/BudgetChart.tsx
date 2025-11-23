import { Box, Paper, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { CATEGORIES } from "./ExpenseList";
import type { Expense } from "../../../../types";
import { formatCurrency } from "../../../../utils/currency";

interface BudgetChartProps {
  expenses: Expense[];
  currency: string;
}

export const BudgetChart = ({ expenses, currency }: BudgetChartProps) => {
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = CATEGORIES.map((cat) => ({
    name: cat.label,
    value: expenses
      .filter((e) => e.category === cat.id)
      .reduce((acc, curr) => acc + curr.amount, 0),
    color: cat.color,
  })).filter((d) => d.value > 0);

  return (
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
              formatter={(value: number) => formatCurrency(value, currency)}
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
                {formatCurrency(data.value, currency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round((data.value / totalSpent) * 100)}%
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
