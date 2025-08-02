import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import UserProfile from "../components/tenants/dashboard/content/UserProfile";
import DashboardCard from "../components/shared/DashboardCard";
import "../styles/bento-layout.scss";
import Settings from "../components/tenants/dashboard/content/Settings";
import CalendarWidget from "../components/tenants/dashboard/content/CalendarWidget";
import MyEngagements from "../components/tenants/dashboard/content/MyEngagements";
import QuickLinks from "../components/tenants/dashboard/content/QuickLinks";
import DepartureDecisionPopup from "../components/tenants/dashboard/content/DepartureDecisionPopup";
import { fetchMyDeparture } from "../services/departureService";
import { Departure } from "../types/tenant";

const TenantPage: React.FC = () => {
  const [departure, setDeparture] = useState<Departure | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkDeparture = async () => {
      try {
        const data = await fetchMyDeparture();
        setDeparture(data);
        setShowPopup(true);
      } catch (error) {
        // This is expected if the user has no open departure request, so we don't show an error.
        console.log("No open departure request found for user.");
      }
    };
    checkDeparture();
  }, []);

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
      {departure && (
        <DepartureDecisionPopup open={showPopup} onClose={() => setShowPopup(false)} departure={departure} />
      )}
    </Box>
  );
};

export default TenantPage;
