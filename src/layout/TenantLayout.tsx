// src/layouts/TenantLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import TenantSidebar from "../components/tenants/TenantSidebar";
import "../styles/global.scss";

const TenantLayout: React.FC = () => {
  return (
    <div className="background">
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <TenantSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            // Removed p:1 - apply padding within child pages or here as needed
            overflowX: "hidden", // Prevent horizontal scroll from sidebar push
            overflowY: "auto", // Allow content to scroll
            height: "100vh", // Ensure content area can fill height
            position: "relative", // Keep if needed for pseudo-elements
            zIndex: 1, // Keep if needed
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </div>
  );
};

export default TenantLayout;
