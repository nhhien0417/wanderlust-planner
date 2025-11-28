import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import { useAuthStore } from "../../store/useAuthStore";
import { AuthLayout } from "./AuthLayout";
import { Link as RouterLink } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { resetPassword } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const { error } = await resetPassword(email);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("success");
    }
  };

  if (status === "success") {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We've sent a password reset link to ${email}`}
      >
        <Box sx={{ textAlign: "center", width: "100%" }}>
          <Mail size={48} color="#4caf50" style={{ marginBottom: 16 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click the link in the email to reset your password. If you don't see
            it, check your spam folder.
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            fullWidth
            variant="outlined"
            startIcon={<ArrowLeft size={18} />}
          >
            Back to Login
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive reset instructions"
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        {status === "error" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          InputProps={{
            startAdornment: (
              <Mail size={18} style={{ marginRight: 8, opacity: 0.5 }} />
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
};
