// src/pages/TenantPage.tsx
import React from "react";
import { Box } from "@mui/material"; // Import Box
import UserProfile from "../components/tenants/dashboard/content/UserProfile";
import DashboardCard from "../components/tenants/dashboard/DashboardCard";
import "../styles/tenantPage.scss";
import Settings from "../components/tenants/dashboard/content/Settings";
import SidebarLayout from "../components/shared/Sidebar"; // Import Sidebar

const TenantPage: React.FC = () => {
  return (
    // Use Flexbox for the overall layout
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar takes its defined width */}
      <SidebarLayout />

      {/* Main content area takes remaining space */}
      {/* Add component="main" for semantic HTML */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // Takes up remaining horizontal space
          p: 1, // Add padding around the content area
          // The sidebar library might handle margin/padding adjustment automatically when open/closed.
          // If not, you might need to add dynamic marginLeft based on sidebar state/width.
          // However, modern sidebar implementations often handle this via transforms or internal padding.
          overflow: "auto", // Add scroll for content overflow
          position: "relative", // Needed for the ::before pseudo-element if you keep it
          zIndex: 1, // Ensure content is above the potential background pseudo-element
        }}
      >
        {/* Your existing grid layout */}
        <div className="grid">
          {/* The ::before element for background blur is now applied here if needed */}
          <div className="left">
            <DashboardCard title="Deine Daten">
              <UserProfile />
            </DashboardCard>
            <DashboardCard title="Statistics">
              {/* Placeholder content */}
              <div>Some stats here</div>
              <div>Some stats here</div>
            </DashboardCard>
          </div>
          <div className="right">
            <DashboardCard title="Notifications">
              <div>Some notifications here</div>
            </DashboardCard>
            <DashboardCard title="Settings">
              <Settings />
            </DashboardCard>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default TenantPage;
