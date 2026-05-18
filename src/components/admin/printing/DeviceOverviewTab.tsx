import React, { useState, useEffect, useCallback } from "react";
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Alert, CircularProgress } from "@mui/material";
import {
  fetchDeviceOverview,
  toggleDeviceActive,
  terminateDeviceSession,
  DeviceOverview,
} from "../../../services/printingService";
import { useNotification } from "../../../context/NotificationContext";
import dayjs from "dayjs";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import StopIcon from "@mui/icons-material/Stop";

const DEVICE_ID = 1; // Currently only one device

const DeviceOverviewTab: React.FC = () => {
  const [overview, setOverview] = useState<DeviceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeviceOverview(DEVICE_ID);
      setOverview(data);
    } catch (err) {
      setError("Geräteübersicht konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
    const interval = setInterval(loadOverview, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadOverview]);

  const handleToggleActive = async () => {
    try {
      await toggleDeviceActive(DEVICE_ID);
      showNotification("Gerätestatus aktualisiert.", "success");
      loadOverview();
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Fehler beim Aktualisieren.", "error");
    }
  };


  const handleTerminateSession = async () => {
    if (!window.confirm("Aktive Session wirklich beenden?")) return;
    try {
      await terminateDeviceSession(DEVICE_ID);
      showNotification("Session beendet.", "success");
      loadOverview();
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Fehler beim Beenden.", "error");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !overview) {
    return <Alert severity="error">{error || "Keine Daten verfügbar"}</Alert>;
  }

  const { device, active_session, statistics } = overview;

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Device Status Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gerätestatus
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Name: {device.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Standort: {device.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  CUPS Name: {device.cups_printer_name}
                </Typography>
              </Box>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Chip
                  label={device.is_active ? "Aktiv" : "Inaktiv"}
                  color={device.is_active ? "success" : "default"}
                  size="small"
                />
              </Box>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PowerSettingsNewIcon />}
                  onClick={handleToggleActive}
                >
                  {device.is_active ? "Deaktivieren" : "Aktivieren"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Session Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aktive Session
              </Typography>
              {active_session ? (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Bewohner: {active_session.tenant_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gestartet: {dayjs(active_session.started_at).format("DD.MM.YYYY HH:mm")}
                  </Typography>
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<StopIcon />}
                      onClick={handleTerminateSession}
                    >
                      Session beenden
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Keine aktive Session
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Cards */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gesamtstatistik
              </Typography>
              <Typography variant="body2">
                Sessions: {statistics.total_sessions}
              </Typography>
              <Typography variant="body2">
                Druckaufträge: {statistics.total_jobs}
              </Typography>
              <Typography variant="body2">
                Seiten: {statistics.total_pages}
              </Typography>
              <Typography variant="body2" fontWeight="bold" mt={1}>
                Einnahmen: {parseFloat(statistics.total_revenue).toFixed(2)} €
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dieser Monat
              </Typography>
              <Typography variant="body2">
                Seiten: {statistics.this_month_pages}
              </Typography>
              <Typography variant="body2" fontWeight="bold" mt={1}>
                Einnahmen: {parseFloat(statistics.this_month_revenue).toFixed(2)} €
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Preis pro Seite: {parseFloat(device.price_per_page_color).toFixed(2)} € (Farbe) / {parseFloat(device.price_per_page_gray).toFixed(2)} € (SW)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeviceOverviewTab;

