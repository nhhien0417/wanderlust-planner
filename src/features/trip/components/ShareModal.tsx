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
} from "@mui/material";
import { X, UserPlus, Trash2, Shield } from "lucide-react";
import { useMembersStore } from "../../../store/useMembersStore";
import { useTripsStore } from "../../../store/useTripsStore";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
}

export const ShareModal = ({ open, onClose, tripId }: ShareModalProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { inviteMember, removeMember } = useMembersStore();

  const trips = useTripsStore((state) => state.trips);
  const members = useMemo(() => {
    const trip = trips.find((t) => t.id === tripId);
    return trip?.members || [];
  }, [trips, tripId]);

  const handleInvite = async () => {
    if (!email) return;
    setError("");
    setSuccess("");

    try {
      await inviteMember(tripId, email);
      setSuccess(`Invited ${email}`);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to invite user");
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await removeMember(tripId, memberId);
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
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
            />
            <Button
              variant="contained"
              startIcon={<UserPlus size={18} />}
              onClick={handleInvite}
              disabled={!email}
            >
              Invite
            </Button>
          </Box>
          {success && (
            <Alert severity="success" sx={{ mt: 1 }}>
              {success}
            </Alert>
          )}
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Members
        </Typography>
        <List dense>
          {members.map((member: any) => (
            <ListItem
              key={member.user_id}
              secondaryAction={
                member.role !== "owner" && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemove(member.user_id)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                <Avatar src={member.avatar_url}>
                  {member.email?.[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={member.full_name || member.email}
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
          {members.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 2, textAlign: "center" }}
            >
              No other members yet.
            </Typography>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};
