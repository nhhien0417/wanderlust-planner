import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useMembersStore } from "../../store/useMembersStore";
import { useAuthStore } from "../../store/useAuthStore";

export const JoinTrip = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { acceptInvite } = useMembersStore();
  const { user, loading: authLoading } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Redirect to login if not authenticated, preserving the join URL
      navigate(`/login?redirectTo=${encodeURIComponent(`/join/${token}`)}`);
      return;
    }

    const join = async () => {
      if (!token) return;
      try {
        const tripId = await acceptInvite(token);
        setStatus("success");
        setTimeout(() => {
          navigate(`/trips/${tripId}`);
        }, 2000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Failed to join trip");
      }
    };

    join();
  }, [token, user, authLoading, navigate, acceptInvite]);

  if (authLoading) return null;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%", textAlign: "center" }}>
        {status === "loading" && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Joining trip...</Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Typography variant="h6" color="success.main" gutterBottom>
              Successfully Joined!
            </Typography>
            <Typography color="text.secondary">
              Redirecting to trip details...
            </Typography>
          </>
        )}

        {status === "error" && (
          <>
            <Typography variant="h6" color="error" gutterBottom>
              Unable to Join
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Button variant="contained" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};
