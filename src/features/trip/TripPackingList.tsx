import { useState, useMemo } from "react";
import { useTripStore } from "../../store/useTripStore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import {
  Plus,
  Trash2,
  CheckCircle2,
  ListChecks,
  Shirt,
  Plug,
  FileText,
  Bath,
  Package,
  HeartPulse,
  FileDown,
} from "lucide-react";
import { exportPackingListToPDF } from "../../utils/pdfExport";

interface TripPackingListProps {
  tripId: string;
}

const CATEGORIES = [
  {
    id: "Clothing",
    label: "Clothing",
    icon: <Shirt size={18} />,
  },
  {
    id: "Toiletries",
    label: "Toiletries",
    icon: <Bath size={18} />,
  },
  {
    id: "Health & Wellness",
    label: "Health & Wellness",
    icon: <HeartPulse size={18} />,
  },
  {
    id: "Electronics",
    label: "Electronics",
    icon: <Plug size={18} />,
  },
  {
    id: "Documents",
    label: "Documents",
    icon: <FileText size={18} />,
  },
  {
    id: "Other",
    label: "Other",
    icon: <Package size={18} />,
  },
];

export const TripPackingList = ({ tripId }: TripPackingListProps) => {
  const trip = useTripStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const addPackingItem = useTripStore((state) => state.addPackingItem);
  const removePackingItem = useTripStore((state) => state.removePackingItem);
  const togglePackingItem = useTripStore((state) => state.togglePackingItem);
  const generatePackingList = useTripStore(
    (state) => state.generatePackingList
  );

  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Other");

  if (!trip) return null;

  const progress = useMemo(() => {
    const packingList = trip.packingList || [];
    if (packingList.length === 0) return 0;
    const checkedCount = packingList.filter((i) => i.checked).length;
    return Math.round((checkedCount / packingList.length) * 100);
  }, [trip.packingList]);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    addPackingItem(tripId, {
      name: newItemName,
      category: newItemCategory,
      isCustom: true,
    });
    setNewItemName("");
  };

  const itemsByCategory = useMemo(() => {
    const packingList = trip.packingList || [];
    const grouped: Record<string, typeof packingList> = {};
    CATEGORIES.forEach((cat) => {
      grouped[cat.id] = packingList.filter((i) => i.category === cat.id);
    });
    // Handle items with unknown categories
    const knownCategories = new Set(CATEGORIES.map((c) => c.id));
    const otherItems = packingList.filter(
      (i) => !knownCategories.has(i.category)
    );
    if (otherItems.length > 0) {
      grouped["Other"] = [...(grouped["Other"] || []), ...otherItems];
    }
    return grouped;
  }, [trip.packingList]);

  const handleExportPDF = () => {
    exportPackingListToPDF({
      tripName: trip.name,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      packingList: trip.packingList || [],
    });
  };

  return (
    <Box sx={{ p: 3, height: "100%", overflowY: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Packing List
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 200 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {progress}% Packed
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ListChecks />}
            onClick={() => generatePackingList(tripId)}
          >
            Generate List
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDown />}
            onClick={handleExportPDF}
            disabled={!trip.packingList || trip.packingList.length === 0}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Add Item Form */}
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

      {/* Categories */}
      <Grid container spacing={3}>
        {CATEGORIES.map((category) => {
          const items = itemsByCategory[category.id] || [];
          return (
            <Grid key={category.id} size={{ xs: 12, md: 6, lg: 4 }}>
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
                            onChange={() => togglePackingItem(tripId, item.id)}
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
                              textDecoration: item.checked
                                ? "line-through"
                                : "none",
                              color: item.checked
                                ? "text.disabled"
                                : "text.primary",
                            }}
                          >
                            {item.name}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removePackingItem(tripId, item.id)}
                          sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
