import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "../../../../utils/currency";
import type { Expense } from "../../../../types";

export const CATEGORIES = [
  { id: "accommodation", label: "Accommodation", color: "#8884d8" },
  { id: "food", label: "Food & Dining", color: "#82ca9d" },
  { id: "transportation", label: "Transportation", color: "#ffc658" },
  { id: "activities", label: "Activities", color: "#ff8042" },
  { id: "shopping", label: "Shopping", color: "#0088fe" },
  { id: "other", label: "Other", color: "#00C49F" },
];

interface ExpenseListProps {
  expenses: Expense[];
  currency: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  readonly?: boolean;
}

export const ExpenseList = ({
  expenses,
  currency,
  onEdit,
  onDelete,
  readonly,
}: ExpenseListProps) => {
  return (
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
              {!readonly && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={readonly ? 4 : 5}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="text.secondary">
                    No expenses recorded yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor:
                            CATEGORIES.find((c) => c.id === expense.category)
                              ?.color || "grey.500",
                        }}
                      />
                      {CATEGORIES.find((c) => c.id === expense.category)
                        ?.label || expense.category}
                    </Box>
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.date || "-"}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {formatCurrency(expense.amount, currency)}
                  </TableCell>
                  {!readonly && (
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => onEdit(expense)}>
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(expense.id)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
