import {
  Paper,
  Box,
  Typography,
  Chip,
  Checkbox,
  IconButton,
} from "@mui/material";
import { CheckCircle2, Trash2 } from "lucide-react";
import type { PackingItem } from "../../types";
import type { ReactNode } from "react";

interface PackingCategoryProps {
  category: { id: string; label: string; icon: ReactNode };
  items: PackingItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PackingCategory = ({
  category,
  items,
  onToggle,
  onDelete,
}: PackingCategoryProps) => {
  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 2,
        borderTop: `4px solid`,
        borderColor: "primary.main",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          pb: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ color: "primary.main" }}>{category.icon}</Box>
        <Typography variant="h6" fontWeight="bold">
          {category.label}
        </Typography>
        <Chip
          label={items.length}
          size="small"
          sx={{ ml: "auto", fontWeight: "bold" }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ py: 2, fontStyle: "italic" }}
          >
            No items yet
          </Typography>
        ) : (
          items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1,
                borderRadius: 1,
                "&:hover": { bgcolor: "grey.50" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: 1,
                }}
              >
                <Checkbox
                  checked={item.checked}
                  onChange={() => onToggle(item.id)}
                  size="small"
                  icon={
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: 1,
                        border: 1,
                        borderColor: "text.disabled",
                      }}
                    />
                  }
                  checkedIcon={<CheckCircle2 size={18} />}
                />
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: item.checked ? "line-through" : "none",
                    color: item.checked ? "text.disabled" : "text.primary",
                  }}
                >
                  {item.name}
                </Typography>
              </Box>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(item.id)}
                sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}
              >
                <Trash2 size={14} />
              </IconButton>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
};
