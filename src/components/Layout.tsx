import React from "react";
import Box from "@mui/material/Box";
import { Sidebar } from "./Sidebar";
import { CreateTripModal } from "./CreateTripModal";
import { useUIStore } from "../store/useUIStore";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
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
        }}
      >
        {children}
      </Box>
      <CreateTripModal
        isOpen={isCreateTripModalOpen}
        onClose={closeCreateTripModal}
      />
    </Box>
  );
};
