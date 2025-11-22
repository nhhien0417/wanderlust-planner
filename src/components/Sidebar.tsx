import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import {
  Layout,
  Calendar,
  Settings,
  PlusCircle,
  LogOut,
  User as UserIcon,
  LogIn,
} from "lucide-react";
import { useTripsStore } from "../store/useTripsStore";
import { useUIStore } from "../store/useUIStore";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "@mui/material/Avatar";

export const Sidebar = () => {
  const { activeTripId, setActiveTrip, trips } = useTripsStore();
  const { openCreateTripModal } = useUIStore();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

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
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
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
              onClick={() => {
                setActiveTrip(null);
                navigate("/dashboard");
              }}
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
                onClick={() => {
                  setActiveTrip(trip.id);
                  navigate(`/trip/${trip.id}`);
                }}
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
        {user ? (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                px: 1,
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                {user.email?.[0].toUpperCase()}
              </Avatar>
              <Box sx={{ overflow: "hidden" }}>
                <Typography variant="subtitle2" noWrap>
                  {user.user_metadata.full_name || "User"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  display="block"
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: "error.main",
                "&:hover": {
                  backgroundColor: "error.lighter",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                <LogOut size={20} />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <ListItemButton
              onClick={() => navigate("/login")}
              sx={{
                borderRadius: 2,
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                <LogIn size={20} />
              </ListItemIcon>
              <ListItemText primary="Sign In" />
            </ListItemButton>
            <ListItemButton
              onClick={() => navigate("/signup")}
              sx={{
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <UserIcon size={20} />
              </ListItemIcon>
              <ListItemText primary="Sign Up" />
            </ListItemButton>
          </Box>
        )}

        <ListItemButton
          sx={{
            borderRadius: 2,
            mt: 1,
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
