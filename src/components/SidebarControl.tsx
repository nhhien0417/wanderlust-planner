import { useState } from "react";
import {
  Box,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
} from "@mui/material";
import {
  PanelLeft,
  Maximize2,
  Minimize2,
  MousePointerClick,
  Check,
} from "lucide-react";
import { useUIStore } from "../store/useUIStore";

export const SidebarControl = () => {
  const { sidebarMode, setSidebarMode } = useUIStore();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeSelect = (mode: "expanded" | "collapsed" | "hover") => {
    setSidebarMode(mode);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "sidebar-control-popover" : undefined;

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color: "text.secondary",
          "&:hover": { color: "primary.main", bgcolor: "primary.lighter" },
        }}
      >
        <PanelLeft size={20} />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: { width: 220, p: 1, borderRadius: 2 },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Sidebar control
          </Typography>
        </Box>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleModeSelect("expanded")}
              selected={sidebarMode === "expanded"}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Maximize2 size={18} />
              </ListItemIcon>
              <ListItemText primary="Expanded" />
              {sidebarMode === "expanded" && <Check size={16} />}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleModeSelect("collapsed")}
              selected={sidebarMode === "collapsed"}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Minimize2 size={18} />
              </ListItemIcon>
              <ListItemText primary="Collapsed" />
              {sidebarMode === "collapsed" && <Check size={16} />}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleModeSelect("hover")}
              selected={sidebarMode === "hover"}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <MousePointerClick size={18} />
              </ListItemIcon>
              <ListItemText primary="Expand on hover" />
              {sidebarMode === "hover" && <Check size={16} />}
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>
    </>
  );
};
