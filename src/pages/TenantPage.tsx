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
import { Departure, GlobalAppSettings, TenantProfile } from "../types/tenant";
import { fetchGlobalSettings } from "../services/engagementService";
import ExternalServicesStatus from "../components/tenants/dashboard/content/ExternalServicesStatus";
import CalendarWidget from "../components/tenants/dashboard/content/CalendarWidget";
import PointsStatus from "../components/tenants/dashboard/content/PointsStatus";
import DonationNote from "../components/tenants/dashboard/content/DonationNote";
import AttendanceHistoryCard from "../components/tenants/AttendanceHistoryCard";
import { lazy, Suspense } from "react";
import { Dialog, DialogContent, DialogTitle, CircularProgress, DialogActions } from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import AttendanceResultPopup from "../components/attendance/AttendanceResultPopup";
import { ATTENDANCE_RESULT_STORAGE_KEY } from "../utils/attendanceConstants";
import TenantTour from "../components/tour/TenantTour";
import { waitForTourAnchors } from "../hooks/useTour";
import { resetTutorial } from "../services/onboardingService";
import apiClient from "../services/api";

const AttendanceScanner = lazy(() => import("../components/tenants/AttendanceScanner"));

const TenantPage: React.FC = () => {
  const [departure, setDeparture] = useState<Departure | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [attendanceHistoryRefresh, setAttendanceHistoryRefresh] = useState(0);
  const [settings, setSettings] = useState<GlobalAppSettings | null>(null);
  const [tourOpen, setTourOpen] = useState(false);

  const handleAttendanceScanSuccess = () => {
    setShowScanner(false);
    setAttendanceHistoryRefresh((prev) => prev + 1);
  };

  useEffect(() => {
    let cancelled = false;

    const checkDepartureAndTour = async () => {
      let hasOpenDeparture = false;
      try {
        const data = await fetchMyDeparture();
        setDeparture(data);
        setShowPopup(true);
        hasOpenDeparture = true;
      } catch (error) {
        // This is expected if the user has no open departure request, so we don't show an error.
        console.log("No open departure request found for user.");
      }

      try {
        const { data: profile } = await apiClient.get<TenantProfile>("/api/tenants/profile-data");
        // The departure decision is time-critical, so it gets this visit to itself - the
        // tour then starts on the next one.
        if (profile.tutorial_completed || hasOpenDeparture || cancelled) return;
        // Cards like "Wohnzeit & Punkte" only exist once their own request returned, so
        // wait for them before measuring anything.
        await waitForTourAnchors(["points", "move-out-info"]);
        if (!cancelled) setTourOpen(true);
      } catch (error) {
        console.error("Could not determine tutorial status.", error);
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

    checkDepartureAndTour();
    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRestartTutorial = async () => {
    try {
      await resetTutorial();
    } catch (error) {
      console.error("Tutorial-Status konnte nicht zurückgesetzt werden.", error);
    }
    setTourOpen(true);
  };

  return (
    <Box sx={{ px: 1, py: 1 }} className="page-root">
      {" "}
      <div className="grid">
        <div className="left">
          <DashboardCard title="Deine Daten" tourId="profile">
            <UserProfile />
          </DashboardCard>
          <DashboardCard title="Spendenaufruf">
            <DonationNote />
          </DashboardCard>
          <DashboardCard
            title="Deine Referate"
            tourId="engagements"
            cardSx={{ maxHeight: "calc(35vh + 40px)", overflowY: "auto" }}
            contentSx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <MyEngagements />
          </DashboardCard>
          <DashboardCard
            title="Services"
            tourId="services"
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
          <DashboardCard title="Quick Links" tourId="quicklinks">
            <QuickLinks></QuickLinks>
          </DashboardCard>
          <DashboardCard title="Kalender" contentSx={{ p: 0 }} tourId="calendar">
            <CalendarWidget></CalendarWidget>
          </DashboardCard>
          <DashboardCard title="Anwesenheit" tourId="attendance-scan">
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
          <DashboardCard title="Settings" tourId="settings">
            <Settings onRestartTutorial={handleRestartTutorial} />
          </DashboardCard>
        </div>
      </div>
      <TenantTour open={tourOpen} onClose={() => setTourOpen(false)} />
      <AttendanceResultPopup
        storageKey={ATTENDANCE_RESULT_STORAGE_KEY}
        onClosed={() => setAttendanceHistoryRefresh((prev) => prev + 1)}
      />
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
