/**
 * Dashboard for subtenant accounts.
 *
 * Subtenants hold a minimal account (wlan/wiki plus their floor group) and see only
 * their own sublet - everything else in SmartDorm is closed to them, in the sidebar by
 * `allowSubtenants` in routesConfig and on the API by SubtenantApiGuardMiddleware.
 */
import React from "react";
import { Box } from "@mui/material";
import DashboardCard from "../../components/shared/DashboardCard";
import SubtenantProfile from "../../components/subtenants/SubtenantProfile";
import DonationNote from "../../components/tenants/dashboard/content/DonationNote";
import ExternalServicesStatus from "../../components/tenants/dashboard/content/ExternalServicesStatus";
import QuickLinks from "../../components/tenants/dashboard/content/QuickLinks";
import CalendarWidget from "../../components/tenants/dashboard/content/CalendarWidget";
import Settings from "../../components/tenants/dashboard/content/Settings";
import "../../styles/subtenant-layout.scss";

const SubtenantDashboardPage: React.FC = () => {
  return (
    <Box sx={{ px: 1, py: 1 }} className="page-root">
      <div className="subtenant-grid">
        <div className="left">
          <DashboardCard title="Deine Daten">
            <SubtenantProfile />
          </DashboardCard>
          <DashboardCard title="Spendenaufruf">
            <DonationNote />
          </DashboardCard>
          {/* Reads the rooms and washing machine APIs directly - external services a
              subtenant is entitled to, so the API guard does not apply. */}
          <DashboardCard
            title="Services"
            contentSx={{ p: "8px 16px" }}
            cardSx={{
              backgroundColor: "rgba(255, 255, 255, 0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <ExternalServicesStatus />
          </DashboardCard>
        </div>
        <div className="right">
          <DashboardCard title="Quick Links">
            <QuickLinks />
          </DashboardCard>
          <DashboardCard title="Kalender" contentSx={{ p: 0 }}>
            <CalendarWidget />
          </DashboardCard>
          <DashboardCard title="Settings">
            <Settings />
          </DashboardCard>
        </div>
      </div>
    </Box>
  );
};

export default SubtenantDashboardPage;
