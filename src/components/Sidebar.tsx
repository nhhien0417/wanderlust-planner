import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Layout, Calendar, Settings, PlusCircle } from "lucide-react";
import { useTripStore } from "../store/useTripStore";
import { useUIStore } from "../store/useUIStore";

export const Sidebar = () => {
  const { activeTripId, setActiveTrip, trips } = useTripStore();
  const { openCreateTripModal } = useUIStore();

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
        }}
      >
        <Box
          component="img"
          src={"/src/assets/logo.png"}
          sx={{
            height: 50,
            width: 50,
          }}
        />
        <Typography variant="h5" fontWeight="800" letterSpacing="-0.5px">
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
              <ListItemText primary="Dashboard" />
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
                <ListItemText primary={trip.name} />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding sx={{ mt: 1 }}>
            <ListItemButton
              onClick={openCreateTripModal}
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
              <ListItemText primary="New Trip" />
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
          <ListItemText primary="Settings" />
        </ListItemButton>
      </Box>
    </Box>
  );
};
