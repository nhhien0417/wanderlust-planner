import { useMemo } from "react";
import { useTripsStore } from "../../store/useTripsStore";
import { usePackingStore } from "../../store/usePackingStore";
import { useAuthStore } from "../../store/useAuthStore";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Shirt, Plug, FileText, Bath, Package, HeartPulse } from "lucide-react";
import { exportPackingListToPDF } from "../../utils/pdfExport";
import {
  PackingHeader,
  AddItemForm,
  PackingCategory,
} from "./components/packing";
import { Container } from "@mui/material";

interface TripPackingListProps {
  tripId: string;
}

const CATEGORIES_CONFIG = [
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
  const trip = useTripsStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const {
    addPackingItem,
    removePackingItem,
    togglePackingItem,
    generatePackingList,
  } = usePackingStore();
  const { user } = useAuthStore();

  const currentMember = useMemo(
    () => trip?.members?.find((m) => m.user_id === user?.id),
    [trip, user]
  );

  const canEdit =
    currentMember?.role === "owner" || currentMember?.role === "editor";

  if (!trip) return null;

  const progress = useMemo(() => {
    const packingList = trip.packingList || [];
    if (packingList.length === 0) return 0;
    const checkedCount = packingList.filter((i) => i.checked).length;
    return Math.round((checkedCount / packingList.length) * 100);
  }, [trip.packingList]);

  const itemsByCategory = useMemo(() => {
    const packingList = trip.packingList || [];
    const grouped: Record<string, typeof packingList> = {};
    CATEGORIES_CONFIG.forEach((cat) => {
      grouped[cat.id] = packingList.filter((i) => i.category === cat.id);
    });
    // Handle items with unknown categories
    const knownCategories = new Set(CATEGORIES_CONFIG.map((c) => c.id));
    const otherItems = packingList.filter(
      (i) => !knownCategories.has(i.category)
    );
    if (otherItems.length > 0) {
      grouped["Other"] = [...(grouped["Other"] || []), ...otherItems];
    }
    return grouped;
  }, [trip.packingList]);

  const handleAddItem = (name: string, category: string) => {
    addPackingItem(tripId, {
      name,
      category,
      isCustom: true,
    });
  };

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
    <Container maxWidth="lg">
      <Box sx={{ height: "100%", overflowY: "auto" }}>
        <PackingHeader
          progress={progress}
          onGenerate={() => canEdit && generatePackingList(tripId)}
          onExport={handleExportPDF}
          hasItems={!!trip.packingList && trip.packingList.length > 0}
          readonly={!canEdit}
        />

        {canEdit && <AddItemForm onAdd={handleAddItem} />}

        <Grid container spacing={3}>
          {CATEGORIES_CONFIG.map((category) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={category.id}>
              <PackingCategory
                category={category}
                items={itemsByCategory[category.id] || []}
                onToggle={(id) => canEdit && togglePackingItem(tripId, id)}
                onDelete={(id) => canEdit && removePackingItem(tripId, id)}
                readonly={!canEdit}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};
