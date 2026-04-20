import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DashboardCard from "../../components/shared/DashboardCard";
import { GlobalAppSettings, EngagementApplicationData } from "../../types/tenant";
import { fetchGlobalSettings, fetchEngagementApplications } from "../../services/engagementService";
import LazyImage from "../../components/shared/LazyImage"; // Import the new component
import { GridDownloadIcon } from "@mui/x-data-grid";
import { API_BASE_URL } from "../../config";
import { getNextSemester, getPreviousSemester } from "../../services/helperService";

const ViewApplicationsPage: React.FC = () => {
  const [settings, setSettings] = useState<GlobalAppSettings | null>(null);
  const [applications, setApplications] = useState<EngagementApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  const availableSemesters = useMemo(() => {
    if (!settings) return [];

    const defaultSemester = settings.show_applications
      ? getNextSemester(settings.current_semester)
      : settings.current_semester;

    const semesters = [
      defaultSemester,
      getPreviousSemester(defaultSemester),
      getPreviousSemester(getPreviousSemester(defaultSemester)),
    ];

    return semesters;
  }, [settings]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const settingsData = await fetchGlobalSettings();
        setSettings(settingsData);

        // Set default semester
        const defaultSemester = settingsData.show_applications
          ? getNextSemester(settingsData.current_semester)
          : settingsData.current_semester;
        setSelectedSemester(defaultSemester);

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
    const grouped = applications.reduce(
      (acc, app) => {
        const deptName = app.department.full_name;
        if (!acc[deptName]) {
          acc[deptName] = [];
        }
        acc[deptName].push(app);
        return acc;
      },
      {} as Record<string, EngagementApplicationData[]>,
    );

    // Sort departments by name
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(sortedEntries);
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
    <Box
      sx={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 3 }}
      className="page-root"
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: { xs: 1, sm: 0 },
            "@media (max-width: 420px)": {
              textAlign: "center",
            },
          }}
        >
          Referatsbewerbungen
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 150 } }}>
            <InputLabel>Semester</InputLabel>
            <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} label="Semester">
              {availableSemesters.map((semester) => (
                <MenuItem key={semester} value={semester}>
                  {semester}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            component="a"
            href={`${API_BASE_URL}/api/tenants/engagement-applications/pdf/?semester=${selectedSemester}`}
            target="_blank"
            variant="contained"
            startIcon={<GridDownloadIcon />}
            fullWidth
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            PDF Herunterladen
          </Button>
        </Box>
      </Paper>

      {Object.entries(groupedApplications).map(([deptName, apps]) => (
        <DashboardCard key={deptName} title={deptName}>
          <Grid container spacing={2}>
            {apps.map((app) => {
              const initials = `${app.tenant.name?.charAt(0) ?? ""}${app.tenant.surname?.charAt(0) ?? ""}`;
              const altText = `${app.tenant.name} ${app.tenant.surname}`;

              return (
                <Grid size={{ xs: 12, md: 12 }} key={app.id}>
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
                      <LazyImage imageUrl={app.image_url} initials={initials} altText={altText} />
                    </Box>

                    {/* Text content */}
                    <Box sx={{ flex: 1, order: { xs: 1, md: 0 }, minWidth: 0 }}>
                      <Typography variant="h6">
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
