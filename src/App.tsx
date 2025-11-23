import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/ui/Layout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { TripDetails } from "./features/trip/TripDetails";
import { Login } from "./features/auth/Login";
import { Signup } from "./features/auth/Signup";
import { useAuthStore } from "./store/useAuthStore";
import { useTripStore } from "./store/useTripStore";
import { Box, CircularProgress } from "@mui/material";

function App() {
  const { initialize, loading, user } = useAuthStore();
  const { fetchTrips } = useTripStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loading) {
      fetchTrips();
    }
  }, [loading, user, fetchTrips]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="trip/:tripId" element={<TripDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
