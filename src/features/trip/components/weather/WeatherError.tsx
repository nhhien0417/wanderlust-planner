import { Box, Typography, Button } from "@mui/material";
import { AlertCircle, RefreshCw } from "lucide-react";

interface WeatherErrorProps {
  destination: string;
  onRetry: () => void;
}

export const WeatherError = ({ destination, onRetry }: WeatherErrorProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
        textAlign: "center",
        gap: 2,
      }}
    >
      <AlertCircle size={48} color="#9ca3af" />
      <Typography variant="h6" fontWeight="bold" color="text.primary">
        Weather Unavailable
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth={400}>
        We couldn't find weather data for "{destination}". We tried looking up
        the specific location and broader regions.
      </Typography>
      <Button
        variant="outlined"
        onClick={onRetry}
        startIcon={<RefreshCw size={16} />}
        sx={{ mt: 2 }}
      >
        Try Again
      </Button>
    </Box>
  );
};
