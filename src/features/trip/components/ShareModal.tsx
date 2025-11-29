import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Alert,
  Divider,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  X,
  UserPlus,
  Trash2,
  Shield,
  Link as LinkIcon,
  Copy,
  Check,
  LogOut,
} from "lucide-react";
import { useMembersStore } from "../../../store/useMembersStore";
import { useTripsStore } from "../../../store/useTripsStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
}

export const ShareModal = ({ open, onClose, tripId }: ShareModalProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    inviteMember,
    removeMember,
    createInvite,
    updateMemberRole,
    leaveTrip,
  } = useMembersStore();
  const { user: currentUser } = useAuthStore();

  const trips = useTripsStore((state) => state.trips);
  const trip = useMemo(
    () => trips.find((t) => t.id === tripId),
    [trips, tripId]
  );
  const members = useMemo(() => trip?.members || [], [trip]);

  const currentMember = useMemo(
    () => members.find((m) => m.user_id === currentUser?.id),
    [members, currentUser]
  );

  const isOwner = currentMember?.role === "owner";

  const handleInvite = async () => {
    if (!email) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await inviteMember(tripId, email, role);
      if (result?.inviteLink) {
        setSuccess(`Invitation created! Link: ${result.inviteLink}`);
        setInviteLink(result.inviteLink); // Also populate the link field
      } else {
        setSuccess(`Invitation sent to ${email}`);
      }
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to invite user");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      const token = await createInvite(tripId, "editor");
      const link = `${window.location.origin}/join/${token}`;
      setInviteLink(link);
    } catch (err: any) {
      setError(err.message || "Failed to generate link");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = async (memberId: string) => {
    try {
      await removeMember(tripId, memberId);
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(tripId, memberId, newRole);
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleLeaveTrip = async () => {
    if (isOwner) {
      const otherOwners = members.filter(
        (m) => m.role === "owner" && m.user_id !== currentUser?.id
      );
      if (otherOwners.length === 0) {
        alert(
          "You are the only owner. Please assign another owner before leaving."
        );
        return;
      }
    }

    try {
      await leaveTrip(tripId);
      onClose();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to leave trip");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Share Trip
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Invite Section (Only for Owners and Editors) */}
        {(isOwner || currentMember?.role === "editor") && (
          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Invite by Email
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!error}
                helperText={error}
                disabled={loading}
              />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  displayEmpty
                >
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={loading ? null : <UserPlus size={18} />}
                onClick={handleInvite}
                disabled={!email || loading}
              >
                {loading ? "Sending..." : "Invite"}
              </Button>
            </Box>
            {success && (
              <Alert severity="success" sx={{ mt: 1 }}>
                {success}
              </Alert>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Invite Link Section */}
        {(isOwner || currentMember?.role === "editor") && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Invite by Link
            </Typography>
            {!inviteLink ? (
              <Button
                variant="outlined"
                startIcon={<LinkIcon size={18} />}
                onClick={handleGenerateLink}
                fullWidth
              >
                Generate Invite Link
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={inviteLink}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Tooltip title={copied ? "Copied!" : "Copy Link"}>
                  <IconButton
                    onClick={handleCopyLink}
                    color={copied ? "success" : "default"}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Members
        </Typography>
        <List dense>
          {members.map((member: any) => (
            <ListItem
              key={member.user_id}
              secondaryAction={
                isOwner && member.user_id !== currentUser?.id ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FormControl size="small" variant="standard">
                      <Select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.user_id, e.target.value)
                        }
                        sx={{ fontSize: "0.875rem" }}
                      >
                        <MenuItem value="owner">Owner</MenuItem>
                        <MenuItem value="editor">Editor</MenuItem>
                        <MenuItem value="viewer">Viewer</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemove(member.user_id)}
                      color="error"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                ) : null
              }
            >
              <ListItemAvatar>
                <Avatar src={member.avatar_url}>
                  {member.email?.[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2">
                      {member.full_name || member.email}
                    </Typography>
                    {member.user_id === currentUser?.id && (
                      <Typography variant="caption" color="text.secondary">
                        (You)
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Shield size={12} />
                    <Typography
                      variant="caption"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {member.role}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {/* Leave Trip Button (Not for Owner) */}
        {!isOwner && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogOut size={18} />}
              onClick={handleLeaveTrip}
            >
              Leave Trip
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
