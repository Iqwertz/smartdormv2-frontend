import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress, Alert, Paper, Grid } from "@mui/material";
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
            {apps.map((app) => {
              const imgSrc = app.image_base64 ? `data:image/jpeg;base64,${app.image_base64}` : undefined;
              const initials = `${app.tenant.name?.charAt(0) ?? ""}${app.tenant.surname?.charAt(0) ?? ""}`;

              return (
                <Grid item xs={12} md={6} key={app.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: 2,
                      alignItems: { xs: "stretch", md: "flex-start" },
                    }}
                  >
                    <Box
                      sx={{
                        order: { xs: 0, md: 1 },
                        width: { xs: "100%", md: 240 },
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        alignItems: "center",
                        ml: { md: 2 },
                      }}
                    >
                      {imgSrc ? (
                        <Box
                          component="img"
                          src={imgSrc}
                          alt={`${app.tenant.name} ${app.tenant.surname}`}
                          sx={{
                            width: "100%",
                            height: { xs: "auto", md: 240 },
                            objectFit: "cover",
                            borderRadius: 1,
                            boxShadow: 1,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: { xs: 180, md: 240 },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "grey.200",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="h4" sx={{ color: "text.secondary" }}>
                            {initials}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Text content */}
                    <Box sx={{ flex: 1, order: { xs: 1, md: 0 }, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ display: { xs: "none", md: "block" } }}>
                        {app.tenant.name} {app.tenant.surname}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                          maxHeight: "250px",
                          overflowY: "auto",
                          mt: 1,
                        }}
                      >
                        {app.motivation}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
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
