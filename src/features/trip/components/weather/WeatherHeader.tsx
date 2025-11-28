import { Box, Typography, Button } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";

interface WeatherHeaderProps {
  destination: string;
  startDate: string;
  endDate: string;
  onRefresh: () => void;
}

export const WeatherHeader = ({
  destination,
  startDate,
  endDate,
  onRefresh,
}: WeatherHeaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 4,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          fontWeight="800"
          color="primary.900"
          gutterBottom
        >
          Weather Forecast
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {destination} • {format(parseISO(startDate), "MMM d")} -{" "}
          {format(parseISO(endDate), "MMM d, yyyy")}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        onClick={onRefresh}
        startIcon={<RefreshCw size={16} />}
        size="small"
      >
        Refresh
      </Button>
    </Box>
  );
};
