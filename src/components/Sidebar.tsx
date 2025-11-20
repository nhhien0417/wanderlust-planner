import React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Map, Layout, Calendar, Settings, PlusCircle } from "lucide-react";
import { useTripStore } from "../store/useTripStore";

export const Sidebar = () => {
  const { activeTripId, setActiveTrip, trips } = useTripStore();

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        backgroundColor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <Map size={32} color="#2563eb" />
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Wanderlust
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 1,
            display: "block",
            px: 2,
            mb: 1,
            mt: 2,
          }}
        >
          Menu
        </Typography>

        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              selected={!activeTripId}
              onClick={() => setActiveTrip(null)}
              sx={{
                borderRadius: 2,
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  color: "primary.dark",
                  "&:hover": {
                    backgroundColor: "primary.light",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Layout size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 1,
            display: "block",
            px: 2,
            mb: 1,
            mt: 3,
          }}
        >
          My Trips
        </Typography>

        <List disablePadding>
          {trips.map((trip) => (
            <ListItem key={trip.id} disablePadding>
              <ListItemButton
                selected={activeTripId === trip.id}
                onClick={() => setActiveTrip(trip.id)}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    color: "primary.dark",
                    "&:hover": {
                      backgroundColor: "primary.light",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Calendar size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={trip.name}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding sx={{ mt: 1 }}>
            <ListItemButton
              sx={{
                borderRadius: 2,
                border: "2px dashed",
                borderColor: "divider",
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "primary.light",
                  color: "primary.dark",
                  borderColor: "primary.main",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PlusCircle size={20} />
              </ListItemIcon>
              <ListItemText
                primary="New Trip"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          sx={{
            borderRadius: 2,
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Settings size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
};
