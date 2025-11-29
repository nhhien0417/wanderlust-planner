import { Box, Typography, LinearProgress, Button } from "@mui/material";
import { ListChecks, FileDown } from "lucide-react";

interface PackingHeaderProps {
  progress: number;
  onGenerate: () => void;
  onExport: () => void;
  hasItems: boolean;
  readonly?: boolean;
}

export const PackingHeader = ({
  progress,
  onGenerate,
  onExport,
  hasItems,
  readonly,
}: PackingHeaderProps) => {
  return (
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
        {!readonly && (
          <Button
            variant="outlined"
            startIcon={<ListChecks />}
            onClick={onGenerate}
          >
            Generate List
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<FileDown />}
          onClick={onExport}
          disabled={!hasItems}
        >
          Export PDF
        </Button>
      </Box>
    </Box>
  );
};
