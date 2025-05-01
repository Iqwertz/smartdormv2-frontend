// src/layouts/AdminLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/global.scss";

const AdminLayout: React.FC = () => {
  return (
    <div className="background">
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: "auto",
            height: "100vh",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </div>
  );
};

export default AdminLayout;
