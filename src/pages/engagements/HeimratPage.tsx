import React, { useState, useEffect } from "react";
import { Box, Switch, FormControlLabel, CircularProgress, Alert, Typography } from "@mui/material";
import DashboardCard from "../../components/shared/DashboardCard";
import "../../styles/bento-layout.scss";
import { GlobalAppSettings } from "../../types/tenant";
import { fetchGlobalSettings } from "../../services/engagementService";
import apiClient from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const HeimratPage: React.FC = () => {
  const [settings, setSettings] = useState<GlobalAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchGlobalSettings()
      .then(setSettings)
      .catch(() => setError("Einstellungen konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  const handleSettingChange = async (settingName: "applications_open" | "show_applications", value: boolean) => {
    if (!settings) return;

    setSettings((prev) => (prev ? { ...prev, [settingName]: value } : null));

    try {
      const endpoint = settingName === "applications_open" ? "set-applications-open" : "set-show-applications";
      await apiClient.post(`/api/engagements/heimrat/${endpoint}/`, { [settingName]: value });
      showNotification("Einstellung erfolgreich gespeichert.", "success");
    } catch (err) {
      showNotification("Speichern fehlgeschlagen.", "error");
      setSettings((prev) => (prev ? { ...prev, [settingName]: !value } : null));
    }
  };

  const renderSettings = () => {
    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!settings) return <Typography>Keine Einstellungen gefunden.</Typography>;

    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.applications_open}
              onChange={(e) => handleSettingChange("applications_open", e.target.checked)}
            />
          }
          label="Bewerbungsphase geöffnet"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.show_applications}
              onChange={(e) => handleSettingChange("show_applications", e.target.checked)}
            />
          }
          label="Bewerbungen für Mieter sichtbar"
        />
      </Box>
    );
  };

  return (
    <Box sx={{ px: 1, py: 1 }}>
      {" "}
      <div className="grid">
        <div className="left"></div>
        <div className="right">
          <DashboardCard title="Bewerbungseinstellungen">{renderSettings()}</DashboardCard>
        </div>
      </div>
    </Box>
  );
};

export default HeimratPage;
