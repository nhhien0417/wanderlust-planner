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
} from "@mui/material";
import {
  PanelLeft,
  Maximize2,
  Minimize2,
  MousePointerClick,
  Check,
} from "lucide-react";
import { useUIStore } from "../../store/useUIStore";

interface SidebarControlProps {
  isCollapsed: boolean;
}

export const SidebarControl = ({ isCollapsed }: SidebarControlProps) => {
  const { sidebarMode, setSidebarMode } = useUIStore();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
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
      <ListItemButton
        onClick={handleClick}
        sx={{
          borderRadius: 1,
          minHeight: 40,
          px: 1,
          mt: 1,
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
          <PanelLeft size={20} color="#888" />
        </Box>
        <ListItemText
          primary="Sidebar control"
          sx={{
            ml: 2,
            my: 0,
            opacity: isCollapsed ? 0 : 1,
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
          }}
        />
      </ListItemButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            width: 225,
            p: 1,
            borderRadius: 1,
            bgcolor: "#2a2a2a",
            color: "#ededed",
            border: "1px solid #3e3e3e",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="#888">
            Sidebar control
          </Typography>
        </Box>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleModeSelect("expanded")}
              selected={sidebarMode === "expanded"}
              sx={{
                borderRadius: 1,
                "&.Mui-selected": {
                  bgcolor: "#3e3e3e",
                  "&:hover": { bgcolor: "#4e4e4e" },
                },
                "&:hover": { bgcolor: "#3e3e3e" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "#ededed" }}>
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
              sx={{
                borderRadius: 1,
                "&.Mui-selected": {
                  bgcolor: "#3e3e3e",
                  "&:hover": { bgcolor: "#4e4e4e" },
                },
                "&:hover": { bgcolor: "#3e3e3e" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "#ededed" }}>
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
              sx={{
                borderRadius: 1,
                "&.Mui-selected": {
                  bgcolor: "#3e3e3e",
                  "&:hover": { bgcolor: "#4e4e4e" },
                },
                "&:hover": { bgcolor: "#3e3e3e" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "#ededed" }}>
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
