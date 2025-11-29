import { useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Link,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useAuthStore } from "../../store/useAuthStore";
import { useTripStore } from "../../store/useTripStore";
import { AuthLayout } from "./AuthLayout";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const { signIn } = useAuthStore();
  const { syncLocalTrips, fetchTrips } = useTripStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;

      // Sync local trips to account
      await syncLocalTrips();
      // Fetch fresh data
      await fetchTrips();

      navigate(redirectTo || "/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue planning your adventures"
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Mail size={18} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Remember me"
          />
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Link
            component={RouterLink}
            to={`/signup${
              redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""
            }`}
            variant="body2"
          >
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
};
