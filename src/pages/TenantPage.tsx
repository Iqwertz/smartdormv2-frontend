import React from "react";
import { Box } from "@mui/material";
import UserProfile from "../components/tenants/dashboard/content/UserProfile";
import DashboardCard from "../components/tenants/dashboard/DashboardCard";
import "../styles/bento-layout.scss";
import Settings from "../components/tenants/dashboard/content/Settings";
import CalendarWidget from "../components/tenants/dashboard/content/CalendarWidget";
import MyEngagements from "../components/tenants/dashboard/content/MyEngagements";
import QuickLinks from "../components/tenants/dashboard/content/QuickLinks";

const TenantPage: React.FC = () => {
  return (
    <Box sx={{ px: 1, py: 1 }}>
      {" "}
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
          <DashboardCard title="Quick Links">
            <QuickLinks></QuickLinks>
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
  );
};

export default TenantPage;
