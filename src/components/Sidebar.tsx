import { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { Layout, Calendar, Settings, PlusCircle, LogIn } from "lucide-react";
import { useTripsStore } from "../store/useTripsStore";
import { useUIStore } from "../store/useUIStore";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "@mui/material/Avatar";
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
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Determine effective state based on mode and hover
  const isCollapsed =
    sidebarMode === "collapsed" || (sidebarMode === "hover" && !isHovered);

  const sidebarWidth = isCollapsed ? 64 : 260;

  return (
    <>
      <Box
        onMouseEnter={() => sidebarMode === "hover" && setIsHovered(true)}
        onMouseLeave={() => sidebarMode === "hover" && setIsHovered(false)}
        sx={{
          width: sidebarWidth,
          height: "100vh",
          bgcolor: "#1c1c1c", // Dark theme background
          color: "#ededed", // Light text
          borderRight: 1,
          borderColor: "#2e2e2e",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s ease",
          overflow: "hidden",
          position: "relative",
          zIndex: 1200, // Ensure it stays above content
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            cursor: "pointer",
            height: 64,
            borderBottom: 1,
            borderColor: "#2e2e2e",
          }}
          onClick={() => navigate("/")}
        >
          <Box
            component="img"
            src={"/src/assets/logo.png"}
            sx={{
              height: 32,
              width: 32,
              minWidth: 32,
            }}
          />
          {!isCollapsed && (
            <Typography
              variant="subtitle1"
              fontWeight="600"
              sx={{ whiteSpace: "nowrap", overflow: "hidden" }}
            >
              Wanderlust
            </Typography>
          )}
        </Box>

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", py: 2 }}>
          <List disablePadding>
            <ListItem disablePadding sx={{ mb: 0.5, px: 1.5 }}>
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
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    px: 1,
                    "&.Mui-selected": {
                      bgcolor: "#2e2e2e",
                      color: "#fff",
                      "&:hover": { bgcolor: "#3e3e3e" },
                    },
                    "&:hover": { bgcolor: "#2e2e2e" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isCollapsed ? 0 : 36,
                      justifyContent: "center",
                      color: "inherit",
                    }}
                  >
                    <Layout size={20} />
                  </ListItemIcon>
                  {!isCollapsed && <ListItemText primary="Dashboard" />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>

          {!isCollapsed && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: 1,
                display: "block",
                px: 3,
                mb: 1,
                mt: 3,
                fontSize: "0.7rem",
              }}
            >
              Projects
            </Typography>
          )}

          {isCollapsed && <Divider sx={{ my: 2, borderColor: "#2e2e2e" }} />}

          <List disablePadding>
            {trips.map((trip) => (
              <ListItem key={trip.id} disablePadding sx={{ mb: 0.5, px: 1.5 }}>
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
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      px: 1,
                      "&.Mui-selected": {
                        bgcolor: "#2e2e2e",
                        color: "#fff",
                        "&:hover": { bgcolor: "#3e3e3e" },
                      },
                      "&:hover": { bgcolor: "#2e2e2e" },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isCollapsed ? 0 : 36,
                        justifyContent: "center",
                        color: "inherit",
                      }}
                    >
                      <Calendar size={20} />
                    </ListItemIcon>
                    {!isCollapsed && (
                      <ListItemText
                        primary={trip.name}
                        primaryTypographyProps={{
                          noWrap: true,
                          fontSize: "0.9rem",
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}

            <ListItem disablePadding sx={{ mt: 1, px: 1.5 }}>
              <Tooltip title={isCollapsed ? "New Trip" : ""} placement="right">
                <ListItemButton
                  onClick={openCreateTripModal}
                  sx={{
                    borderRadius: 1,
                    minHeight: 40,
                    border: "1px dashed #444",
                    color: "#888",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    px: 1,
                    "&:hover": {
                      bgcolor: "#2e2e2e",
                      color: "#fff",
                      borderColor: "#666",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isCollapsed ? 0 : 36,
                      justifyContent: "center",
                      color: "inherit",
                    }}
                  >
                    <PlusCircle size={20} />
                  </ListItemIcon>
                  {!isCollapsed && <ListItemText primary="New Trip" />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 1.5, borderTop: 1, borderColor: "#2e2e2e" }}>
          <Tooltip title={isCollapsed ? "Settings" : ""} placement="right">
            <ListItemButton
              onClick={openSettingsModal}
              sx={{
                borderRadius: 1,
                minHeight: 40,
                justifyContent: isCollapsed ? "center" : "flex-start",
                px: 1,
                mb: 0.5,
                "&:hover": { bgcolor: "#2e2e2e" },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isCollapsed ? 0 : 36,
                  justifyContent: "center",
                  color: "#888",
                }}
              >
                <Settings size={20} />
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary="Settings" />}
            </ListItemButton>
          </Tooltip>

          {user ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: 2,
                px: 1,
                py: 1,
              }}
            >
              <Tooltip
                title={isCollapsed ? user.email || "User" : ""}
                placement="right"
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: "primary.main",
                    fontSize: 12,
                  }}
                >
                  {user.email?.[0].toUpperCase()}
                </Avatar>
              </Tooltip>
              {!isCollapsed && (
                <Box sx={{ overflow: "hidden" }}>
                  <Typography variant="body2" noWrap fontSize="0.85rem">
                    {user.user_metadata.full_name || "User"}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Tooltip title={isCollapsed ? "Sign In" : ""} placement="right">
              <ListItemButton
                onClick={() => navigate("/login")}
                sx={{
                  borderRadius: 1,
                  minHeight: 40,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  px: 1,
                  "&:hover": { bgcolor: "#2e2e2e" },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isCollapsed ? 0 : 36,
                    justifyContent: "center",
                    color: "#888",
                  }}
                >
                  <LogIn size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Sign In" />}
              </ListItemButton>
            </Tooltip>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: isCollapsed ? "center" : "flex-end",
              mt: 1,
            }}
          >
            <SidebarControl />
          </Box>
        </Box>
      </Box>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
      />
    </>
  );
};
