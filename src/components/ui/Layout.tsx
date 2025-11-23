import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import { Sidebar } from "./Sidebar";
import { CreateTripModal } from "../../features/trip/components/CreateTripModal";
import { useUIStore } from "../../store/useUIStore";

export const Layout = () => {
  const { isCreateTripModalOpen, closeCreateTripModal } = useUIStore();

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "auto",
          backgroundColor: "background.default",
          position: "relative",
        }}
      >
        <Outlet />
      </Box>
      <CreateTripModal
        isOpen={isCreateTripModalOpen}
        onClose={closeCreateTripModal}
      />
    </Box>
  );
};
