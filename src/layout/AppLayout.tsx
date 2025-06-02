import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import AppSidebar from "../components/shared/Sidebar";
import "../styles/global.scss";

const AppLayout: React.FC = () => {
  return (
    <div className="background">
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AppSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 2, md: 3 },
            overflowX: "hidden",
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

export default AppLayout;
