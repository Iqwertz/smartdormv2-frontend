import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import UserProfile from "../components/tenants/dashboard/content/UserProfile";
import DashboardCard from "../components/shared/DashboardCard";
import "../styles/bento-layout.scss";
import Settings from "../components/tenants/dashboard/content/Settings";
//import CalendarWidget from "../components/tenants/dashboard/content/CalendarWidget";
import MyEngagements from "../components/tenants/dashboard/content/MyEngagements";
import QuickLinks from "../components/tenants/dashboard/content/QuickLinks";
import DepartureDecisionPopup from "../components/tenants/dashboard/content/DepartureDecisionPopup";
import { fetchMyDeparture } from "../services/departureService";
import { Departure, GlobalAppSettings } from "../types/tenant";
import { fetchGlobalSettings } from "../services/engagementService";

const TenantPage: React.FC = () => {
  const [departure, setDeparture] = useState<Departure | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [settings, setSettings] = useState<GlobalAppSettings | null>(null);

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
    const loadSettings = async () => {
      try {
        const data = await fetchGlobalSettings();
        setSettings(data);
      } catch (error) {
        console.error("Could not fetch global settings.", error);
      }
    };
    checkDeparture();
    loadSettings();
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
          {settings?.applications_open && (
            <DashboardCard title="Referatsbewerbung">
              <Typography sx={{ mb: 2 }}>Die Bewerbungsphase für das nächste Semester ist jetzt geöffnet.</Typography>
              <Button component={Link} to="/apply-engagement" variant="contained" fullWidth>
                Jetzt bewerben
              </Button>
            </DashboardCard>
          )}
          {settings?.show_applications && (
            <DashboardCard title="Bewerbungen einsehen">
              <Typography sx={{ mb: 2 }}>Sieh dir die Bewerbungen für das kommende Semester an.</Typography>
              <Button component={Link} to="/view-applications" variant="contained" fullWidth>
                Bewerbungen ansehen
              </Button>
            </DashboardCard>
          )}
          <DashboardCard title="Quick Links">
            <QuickLinks></QuickLinks>
          </DashboardCard>
          <DashboardCard title="Kalendar">
            {/* <CalendarWidget></CalendarWidget> */}
            Coming soon...
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
