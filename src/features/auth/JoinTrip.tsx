import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
} from "@mui/material";
import { supabase } from "../../../supabase/supabase";
import { useAuthStore } from "../../store/useAuthStore";
import { useTripsStore } from "../../store/useTripsStore";

export const JoinTrip = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchTrips } = useTripsStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Joining trip...");

  useEffect(() => {
    const joinTrip = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid invite link.");
        return;
      }

      if (!user) {
        // Redirect to signup if not logged in, preserving the join token
        const returnUrl = encodeURIComponent(`/join/${token}`);
        navigate(`/signup?redirectTo=${returnUrl}`);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("join_trip_via_token", {
          invite_token: token,
        });

        if (error) throw error;

        if (data && data.success) {
          setStatus("success");
          setMessage("Successfully joined the trip!");
          await fetchTrips(); // Refresh trips to show the new one
          setTimeout(() => {
            navigate(`/trip/${data.trip_id}`);
          }, 1500);
        } else {
          setStatus("error");
          setMessage(data?.message || "Failed to join trip.");
        }
      } catch (err: any) {
        console.error("Error joining trip:", err);
        setStatus("error");
        setMessage(err.message || "An unexpected error occurred.");
      }
    };

    joinTrip();
  }, [token, user, navigate, fetchTrips]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        {status === "loading" && (
          <>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6">{message}</Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Typography variant="h5" color="success.main" gutterBottom>
              Welcome Aboard!
            </Typography>
            <Typography color="text.secondary">{message}</Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 2 }}>
              Redirecting to trip...
            </Typography>
          </>
        )}

        {status === "error" && (
          <>
            <Typography variant="h5" color="error.main" gutterBottom>
              Oops!
            </Typography>
            <Typography color="text.secondary" paragraph>
              {message}
            </Typography>
            <Button variant="contained" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};
