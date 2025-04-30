// src/pages/TenantPage.tsx
import React from "react";
import { Box } from "@mui/material"; // Import Box
import UserProfile from "../components/tenants/dashboard/content/UserProfile";
import DashboardCard from "../components/tenants/dashboard/DashboardCard";
import "../styles/bento-layout.scss";
import "../styles/global.scss";
import Settings from "../components/tenants/dashboard/content/Settings";
import CalendarWidget from "../components/tenants/dashboard/content/CalendarWidget";
import MyEngagements from "../components/tenants/dashboard/content/MyEngagements";
import TenantSidebar from "../components/tenants/TenantSidebar";

const TenantPage: React.FC = () => {
  return (
    // Use Flexbox for the overall layout
    <div className="background">
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <TenantSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 1,
            overflowX: "hidden",
            overflowY: "auto",
            height: "100vh",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="grid">
            <div className="left">
              <DashboardCard title="Deine Daten">
                <UserProfile />
              </DashboardCard>
              <DashboardCard
                title="Meine Referate"
                cardSx={{ maxHeight: "calc(35vh + 40px)", overflowY: "auto" }}
                contentSx={{ height: "100%", display: "flex", flexDirection: "column" }}
              >
                <MyEngagements />
              </DashboardCard>
            </div>
            <div className="right">
              <DashboardCard title="Notifications">
                <div>Some notifications here</div>
              </DashboardCard>
              <DashboardCard title="Kalendar">
                <CalendarWidget></CalendarWidget>
              </DashboardCard>
              <DashboardCard title="Settings">
                <Settings />
              </DashboardCard>
            </div>
          </div>
        </Box>
      </Box>
    </div>
  );
};

export default TenantPage;
