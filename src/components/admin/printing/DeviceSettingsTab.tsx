import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";
import {
  fetchDeviceOverview,
  updateDeviceSettings,
  DeviceOverview,
} from "../../../services/printingService";
import { useNotification } from "../../../context/NotificationContext";

const DEVICE_ID = 1;

const DeviceSettingsTab: React.FC = () => {
  const [overview, setOverview] = useState<DeviceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const [pricePerPageColor, setPricePerPageColor] = useState<string>("");
  const [pricePerPageGray, setPricePerPageGray] = useState<string>("");
  const [sessionDuration, setSessionDuration] = useState<number>(30);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDeviceOverview(DEVICE_ID);
        setOverview(data);
        setPricePerPageColor(parseFloat(data.device.price_per_page_color).toFixed(2));
        setPricePerPageGray(parseFloat(data.device.price_per_page_gray).toFixed(2));
        setSessionDuration(data.device.max_session_duration_minutes);
      } catch (err) {
        setError("Einstellungen konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    const priceColor = parseFloat(pricePerPageColor);
    const priceGray = parseFloat(pricePerPageGray);
    if (isNaN(priceColor) || priceColor < 0 || isNaN(priceGray) || priceGray < 0) {
      showNotification("Ungültige Preise.", "error");
      return;
    }

    if (sessionDuration < 1) {
      showNotification("Ungültige Session-Dauer.", "error");
      return;
    }

    setSaving(true);
    try {
      await updateDeviceSettings(DEVICE_ID, {
        price_per_page_color: priceColor.toFixed(2),
        price_per_page_gray: priceGray.toFixed(2),
        max_session_duration_minutes: sessionDuration,
      });
      showNotification("Einstellungen gespeichert.", "success");
      // Reload to get updated data
      const data = await fetchDeviceOverview(DEVICE_ID);
      setOverview(data);
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Fehler beim Speichern.", "error");
    } finally {
      setSaving(false);
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

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Drucker-Einstellungen
          </Typography>
          <Box mt={3} display="flex" flexDirection="column" gap={3} maxWidth={500}>
            <TextField
              label="Preis pro Seite - Farbe (€)"
              type="number"
              value={pricePerPageColor}
              onChange={(e) => setPricePerPageColor(e.target.value)}
              inputProps={{ step: "0.01", min: "0" }}
              helperText={`Aktuell: ${parseFloat(overview.device.price_per_page_color).toFixed(2)} €`}
            />
            <TextField
              label="Preis pro Seite - Schwarz-Weiß (€)"
              type="number"
              value={pricePerPageGray}
              onChange={(e) => setPricePerPageGray(e.target.value)}
              inputProps={{ step: "0.01", min: "0" }}
              helperText={`Aktuell: ${parseFloat(overview.device.price_per_page_gray).toFixed(2)} €`}
            />
            <TextField
              label="Maximale Session-Dauer (Minuten)"
              type="number"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(parseInt(e.target.value) || 30)}
              inputProps={{ min: "1" }}
              helperText="Nach dieser Zeit endet die Session automatisch"
            />
            <Box>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? "Speichern..." : "Speichern"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeviceSettingsTab;

