import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useAuthStore } from "../../store/useAuthStore";
import { AuthLayout } from "./AuthLayout";
import { Lock, Eye, EyeOff } from "lucide-react";

export const UpdatePassword = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/[0-9]/)) strength += 25;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return "error";
    if (strength <= 50) return "warning";
    if (strength <= 75) return "info";
    return "success";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setStatus("error");
      return;
    }

    if (passwordStrength < 50) {
      setMessage(
        "Password is too weak. Use at least 8 characters and mix letters/numbers."
      );
      setStatus("error");
      return;
    }

    setStatus("loading");

    const { error } = await updatePassword(password);

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("success");
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  };

  if (status === "success") {
    return (
      <AuthLayout
        title="Password Updated"
        subtitle="Your password has been changed successfully"
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Update Password"
      subtitle="Enter your new password below"
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        {message && (
          <Alert
            severity={status === "error" ? "error" : "info"}
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="New Password"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={status === "loading"}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={18} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {password && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={passwordStrength}
              color={getStrengthColor(passwordStrength)}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              Password Strength:{" "}
              {passwordStrength < 50
                ? "Weak"
                : passwordStrength < 75
                ? "Medium"
                : "Strong"}
            </Typography>
          </Box>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={status === "loading"}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={18} />
              </InputAdornment>
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
            "Update Password"
          )}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate(-1)}
          disabled={status === "loading"}
        >
          Cancel
        </Button>
      </Box>
    </AuthLayout>
  );
};
