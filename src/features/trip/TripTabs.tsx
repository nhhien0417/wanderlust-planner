import { Box, Container, Tabs, Tab, Badge } from "@mui/material";

interface TripTabsProps {
  currentTab: number;
  onTabChange: (newValue: number) => void;
  photoCount: number;
}

export const TripTabs = ({
  currentTab,
  onTabChange,
  photoCount,
}: TripTabsProps) => {
  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "white",
        mt: 3,
      }}
    >
      <Container maxWidth="lg">
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => onTabChange(newValue)}
          aria-label="trip tabs"
        >
          <Tab label="Itinerary" />
          <Tab label="Board" />
          <Tab label="Budget" />
          <Tab label="Packing List" />
          <Tab label="Weather" />
          <Tab
            label={
              <Badge badgeContent={photoCount} color="primary">
                Photos
              </Badge>
            }
          />
        </Tabs>
      </Container>
    </Box>
  );
};
