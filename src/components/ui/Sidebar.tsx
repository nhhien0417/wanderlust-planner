import { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { Layout, Calendar, Settings, PlusCircle } from "lucide-react";
import { useTripsStore } from "../../store/useTripsStore";
import { useUIStore } from "../../store/useUIStore";
import { useNavigate } from "react-router-dom";
import { SettingsModal } from "./SettingsModal";
import { SidebarControl } from "./SidebarControl";

export const Sidebar = () => {
  const { activeTripId, setActiveTrip, trips } = useTripsStore();
  const {
    openCreateTripModal,
    sidebarMode,
    isSettingsModalOpen,
    openSettingsModal,
    closeSettingsModal,
  } = useUIStore();

  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Determine effective state based on mode and hover
  const isCollapsed =
    sidebarMode === "collapsed" || (sidebarMode === "hover" && !isHovered);

  const sidebarWidth = isCollapsed ? 65 : 255;

  return (
    <>
      <Box
        onMouseEnter={() => sidebarMode === "hover" && setIsHovered(true)}
        onMouseLeave={() => sidebarMode === "hover" && setIsHovered(false)}
        sx={{
          width: sidebarWidth,
          height: "100vh",
          bgcolor: "#1c1c1c",
          color: "#ededed",
          borderRight: 1,
          borderColor: "#2e2e2e",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          position: "relative",
          zIndex: 1200,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: 65,
            cursor: "pointer",
            px: 1.75,
          }}
          onClick={() => navigate("/")}
        >
          <Box
            component="img"
            src={"/src/assets/logo.png"}
            sx={{
              height: 32,
              width: 32,
              flexShrink: 0,
            }}
          />

          <Typography
            variant="subtitle1"
            fontWeight="600"
            sx={{
              whiteSpace: "nowrap",
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.2s",
              ml: 1.5,
            }}
          >
            Wanderlust
          </Typography>
        </Box>

        {/* Navigation */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            py: 2,
            overflowX: "hidden",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <List disablePadding>
            <ListItem disablePadding sx={{ px: 1.5, mb: 0.5 }}>
              <Tooltip title={isCollapsed ? "Dashboard" : ""} placement="right">
                <ListItemButton
                  selected={!activeTripId}
                  onClick={() => {
                    setActiveTrip(null);
                    navigate("/dashboard");
                  }}
                  sx={{
                    borderRadius: 1,
                    minHeight: 40,
                    px: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    transition: "background-color 0.2s",
                    "&.Mui-selected": {
                      bgcolor: "#2e2e2e",
                      color: "#fff",
                      "&:hover": { bgcolor: "#3e3e3e" },
                    },
                    "&:hover": { bgcolor: "#2e2e2e" },
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Layout size={20} />
                  </Box>
                  <ListItemText
                    primary="Dashboard"
                    sx={{
                      ml: 2,
                      my: 0,
                      opacity: isCollapsed ? 0 : 1,
                      transition: "opacity 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>

          <Divider sx={{ my: 2, borderColor: "#2e2e2e", mx: 2 }} />

          <List disablePadding>
            {trips.map((trip) => (
              <ListItem key={trip.id} disablePadding sx={{ px: 1.5, mb: 0.5 }}>
                <Tooltip title={isCollapsed ? trip.name : ""} placement="right">
                  <ListItemButton
                    selected={activeTripId === trip.id}
                    onClick={() => {
                      setActiveTrip(trip.id);
                      navigate(`/trip/${trip.id}`);
                    }}
                    sx={{
                      borderRadius: 1,
                      minHeight: 40,
                      px: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      transition: "background-color 0.2s",
                      "&.Mui-selected": {
                        bgcolor: "#2e2e2e",
                        color: "#fff",
                        "&:hover": { bgcolor: "#3e3e3e" },
                      },
                      "&:hover": { bgcolor: "#2e2e2e" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Calendar size={20} />
                    </Box>
                    <ListItemText
                      primary={trip.name}
                      primaryTypographyProps={{
                        noWrap: true,
                        fontSize: "0.9rem",
                      }}
                      sx={{
                        ml: 2,
                        my: 0,
                        opacity: isCollapsed ? 0 : 1,
                        transition: "opacity 0.2s",
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}

            <ListItem disablePadding sx={{ px: 1.5, mt: 1 }}>
              <Tooltip title={isCollapsed ? "New Trip" : ""} placement="right">
                <ListItemButton
                  onClick={openCreateTripModal}
                  sx={{
                    borderRadius: 1,
                    minHeight: 40,
                    border: "1px dashed #444",
                    color: "#888",
                    px: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    transition: "background-color 0.2s, border-color 0.2s",
                    "&:hover": {
                      bgcolor: "#2e2e2e",
                      color: "#fff",
                      borderColor: "#666",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <PlusCircle size={20} />
                  </Box>
                  <ListItemText
                    primary="New Trip"
                    sx={{
                      ml: 2,
                      my: 0,
                      opacity: isCollapsed ? 0 : 1,
                      transition: "opacity 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 0,
            pb: 2,
            borderTop: 1,
            borderColor: "#2e2e2e",
          }}
        >
          <ListItem disablePadding sx={{ px: 1.5 }}>
            <Tooltip title={isCollapsed ? "Settings" : ""} placement="right">
              <ListItemButton
                onClick={openSettingsModal}
                sx={{
                  borderRadius: 1,
                  minHeight: 40,
                  px: 1,
                  mt: 1.5,
                  mb: 0.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  transition: "background-color 0.2s",
                  "&:hover": { bgcolor: "#2e2e2e" },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Settings size={20} color="#888" />
                </Box>
                <ListItemText
                  primary="Settings"
                  sx={{
                    ml: 2,
                    my: 0,
                    opacity: isCollapsed ? 0 : 1,
                    transition: "opacity 0.2s",
                    whiteSpace: "nowrap",
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>

          <ListItem disablePadding sx={{ px: 1.5 }}>
            <SidebarControl isCollapsed={isCollapsed} />
          </ListItem>
        </Box>
      </Box>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
      />
    </>
  );
};
