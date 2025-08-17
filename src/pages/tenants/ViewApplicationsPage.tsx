import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress, Alert, Paper, Avatar, Grid } from "@mui/material";
import DashboardCard from "../../components/shared/DashboardCard";
import { GlobalAppSettings, EngagementApplicationData } from "../../types/tenant";
import { fetchGlobalSettings, fetchEngagementApplications } from "../../services/engagementService";

const ViewApplicationsPage: React.FC = () => {
  const [settings, setSettings] = useState<GlobalAppSettings | null>(null);
  const [applications, setApplications] = useState<EngagementApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const settingsData = await fetchGlobalSettings();
        setSettings(settingsData);
        if (settingsData.show_applications) {
          const appsData = await fetchEngagementApplications();
          setApplications(appsData);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Daten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const groupedApplications = useMemo(() => {
    if (!applications) return {};
    return applications.reduce((acc, app) => {
      const deptName = app.department.full_name;
      if (!acc[deptName]) {
        acc[deptName] = [];
      }
      acc[deptName].push(app);
      return acc;
    }, {} as Record<string, EngagementApplicationData[]>);
  }, [applications]);

  if (loading) return <CircularProgress />;

  if (!settings?.show_applications) {
    return (
      <Box sx={{ maxWidth: "1000px", margin: "0 auto" }}>
        <DashboardCard title="Bewerbungen">
          <Alert severity="info">Die Bewerbungen sind momentan nicht einsehbar.</Alert>
        </DashboardCard>
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 3 }}>
      {Object.entries(groupedApplications).map(([deptName, apps]) => (
        <DashboardCard key={deptName} title={deptName}>
          <Grid container spacing={2}>
            {apps.map((app) => (
              <Grid item xs={12} md={6} key={app.id}>
                <Paper variant="outlined" sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
                    <Avatar
                      src={app.image_base64 ? `data:image/jpeg;base64,${app.image_base64}` : undefined}
                      sx={{ width: 64, height: 64 }}
                    >
                      {app.tenant.name.charAt(0)}
                      {app.tenant.surname.charAt(0)}
                    </Avatar>
                    <Typography variant="h6">
                      {app.tenant.name} {app.tenant.surname}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", maxHeight: "250px", overflowY: "auto", flexGrow: 1 }}
                  >
                    {app.motivation}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DashboardCard>
      ))}
      {applications.length === 0 && !loading && (
        <DashboardCard title="Bewerbungen">
          <Typography sx={{ textAlign: "center", p: 2 }}>Es wurden noch keine Bewerbungen eingereicht.</Typography>
        </DashboardCard>
      )}
    </Box>
  );
};

export default ViewApplicationsPage;
