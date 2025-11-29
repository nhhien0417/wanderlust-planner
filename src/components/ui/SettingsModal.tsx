import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Typography,
  Switch,
  Select,
  MenuItem,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import { User, Settings, LogOut, Moon, Sun } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  // Mock settings state for now
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currency, setCurrency] = useState("USD");

  const handleLogout = async () => {
    await signOut();
    onClose();
    navigate("/dashboard");
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Settings size={24} />
        Settings
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="settings tabs"
          >
            <Tab
              icon={<Settings size={18} />}
              iconPosition="start"
              label="General"
            />
            <Tab
              icon={<User size={18} />}
              iconPosition="start"
              label="Account"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                <Typography>Dark Mode</Typography>
              </Box>
              <Switch
                checked={isDarkMode}
                onChange={(e) => setIsDarkMode(e.target.checked)}
              />
            </Box>

            <Divider />

            <Box>
              <Typography gutterBottom>Default Currency</Typography>
              <Select
                fullWidth
                size="small"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
                <MenuItem value="JPY">JPY (¥)</MenuItem>
                <MenuItem value="VND">VND (₫)</MenuItem>
              </Select>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {user ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  fontSize: 32,
                }}
              >
                {user.email?.[0].toUpperCase()}
              </Avatar>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6">
                  {user.user_metadata.full_name || "User"}
                </Typography>
                <Typography color="text.secondary">{user.email}</Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LogOut />}
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    onClose();
                    navigate("/update-password");
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                Please sign in to view account settings.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  onClose();
                  navigate("/login");
                }}
                sx={{ mt: 2 }}
              >
                Sign In
              </Button>
            </Box>
          )}
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};
