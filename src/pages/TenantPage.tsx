import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import UserProfile from "../components/tenants/dashboard/content/UserProfile";
import DashboardCard from "../components/shared/DashboardCard";
import "../styles/bento-layout.scss";
import Settings from "../components/tenants/dashboard/content/Settings";
import MyEngagements from "../components/tenants/dashboard/content/MyEngagements";
import QuickLinks from "../components/tenants/dashboard/content/QuickLinks";
import DepartureDecisionPopup from "../components/tenants/dashboard/content/DepartureDecisionPopup";
import { fetchMyDeparture } from "../services/departureService";
import { Departure, GlobalAppSettings } from "../types/tenant";
import { fetchGlobalSettings } from "../services/engagementService";
import ExternalServicesStatus from "../components/tenants/dashboard/content/ExternalServicesStatus";
import CalendarWidget from "../components/tenants/dashboard/content/CalendarWidget";
import PointsStatus from "../components/tenants/dashboard/content/PointsStatus";
import AttendanceHistoryCard from "../components/tenants/AttendanceHistoryCard";
import { lazy, Suspense } from "react";
import { Dialog, DialogContent, DialogTitle, CircularProgress, DialogActions } from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

const AttendanceScanner = lazy(() => import("../components/tenants/AttendanceScanner"));

const TenantPage: React.FC = () => {
  const [departure, setDeparture] = useState<Departure | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [attendanceHistoryRefresh, setAttendanceHistoryRefresh] = useState(0);
  const [settings, setSettings] = useState<GlobalAppSettings | null>(null);

  const handleAttendanceScanSuccess = () => {
    setShowScanner(false);
    setAttendanceHistoryRefresh((prev) => prev + 1);
  };

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
    <Box sx={{ px: 1, py: 1 }} className="page-root">
      {" "}
      <div className="grid">
        <div className="left">
          <DashboardCard title="Deine Daten">
            <UserProfile />
          </DashboardCard>
          <DashboardCard
            title="Deine Referate"
            cardSx={{ maxHeight: "calc(35vh + 40px)", overflowY: "auto" }}
            contentSx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <MyEngagements />
          </DashboardCard>
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
            <QuickLinks></QuickLinks>
          </DashboardCard>
          <DashboardCard title="Kalender" contentSx={{ p: 0 }}>
            <CalendarWidget></CalendarWidget>
          </DashboardCard>
          <DashboardCard title="Anwesenheit">
            <Button
              variant="contained"
              fullWidth
              startIcon={<QrCodeScannerIcon />}
              onClick={() => setShowScanner(true)}
            >
              QR Code Scannen
            </Button>
          </DashboardCard>
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
          <PointsStatus />
          <AttendanceHistoryCard refreshTrigger={attendanceHistoryRefresh} />
          <DashboardCard title="Settings">
            <Settings />
          </DashboardCard>
        </div>
      </div>
      {departure && (
        <DepartureDecisionPopup open={showPopup} onClose={() => setShowPopup(false)} departure={departure} />
      )}
      <Dialog
        open={showScanner}
        onClose={() => setShowScanner(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
            overflow: "visible", // So the dashboard card title chip isn't cut off
          },
        }}
      >
        <DashboardCard title="Anwesenheit scannen" contentSx={{ p: 2 }}>
          <Suspense
            fallback={
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            }
          >
            <AttendanceScanner active={showScanner} isModal={true} onSuccess={handleAttendanceScanSuccess} />
          </Suspense>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button onClick={() => setShowScanner(false)}>Abbrechen</Button>
          </Box>
        </DashboardCard>
      </Dialog>
    </Box>
  );
};

export default TenantPage;
