import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Autocomplete,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import { GlobalAppSettings, EngagementApplicationData, DepartmentForSelect } from "../../types/tenant";
import {
  fetchGlobalSettings,
  heimratFetchApplications,
  heimratDeleteApplication,
  heimratCreateApplication,
  fetchDepartmentsForSelect,
} from "../../services/engagementService";
import { fetchRecipientsForSelect } from "../../services/parcelService";
import apiClient from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import { TenantForSelect } from "../../types/parcel";
import imageCompression from "browser-image-compression";
import { API_BASE_URL } from "../../config";
import { ALL_FLOORS } from "../../config";
import dayjs from "dayjs";
import { updateSemesterAndLdap } from "../../services/engagementService";

// --- Helper ---
const generateSemesterOptions = (): string[] => {
  //could be unified in a helper service
  const currentYear = new Date().getFullYear();
  const shortYear = currentYear % 100;
  const semesters: string[] = [];
  for (let i = 2; i >= -2; i--) {
    const year = shortYear - i;
    semesters.push(`WS${year}/${(year + 1).toString().padStart(2, "0")}`);
    semesters.push(`SS${year + 1}`); // SS for the following year
  }
  return semesters.reverse();
};

// --- Settings Component ---
const HeimratSettings: React.FC = () => {
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
    const originalValue = settings[settingName];
    setSettings((prev) => (prev ? { ...prev, [settingName]: value } : null));

    try {
      const endpoint = settingName === "applications_open" ? "set-applications-open" : "set-show-applications";
      await apiClient.post(`/api/engagements/heimrat/${endpoint}/`, { [settingName]: value });
      showNotification("Einstellung erfolgreich gespeichert.", "success");
    } catch (err) {
      showNotification("Speichern fehlgeschlagen.", "error");
      setSettings((prev) => (prev ? { ...prev, [settingName]: originalValue } : null));
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!settings) return <Typography>Keine Einstellungen gefunden.</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={settings.applications_open}
            onChange={(e) => handleSettingChange("applications_open", e.target.checked)}
          />
        }
        label="Bewerbungsphase für Mieter geöffnet"
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

// --- Create Application Form Component ---
const HeimratCreateApplicationForm: React.FC = () => {
  const { showNotification } = useNotification();
  const [tenants, setTenants] = useState<TenantForSelect[]>([]);
  const [departments, setDepartments] = useState<DepartmentForSelect[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantForSelect | null>(null);
  const [selectedDept, setSelectedDept] = useState<DepartmentForSelect | null>(null);
  const [motivation, setMotivation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tenantsData, deptsData] = await Promise.all([
          fetchRecipientsForSelect("tenants"),
          fetchDepartmentsForSelect(),
        ]);
        setTenants(tenantsData);
        setDepartments(deptsData);
      } catch (err) {
        setError("Daten für Formular konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !selectedDept) {
      setError("Bitte Mieter und Referat auswählen.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("tenant", selectedTenant.id);
      formData.append("department", selectedDept.id.toString());
      formData.append("motivation", motivation);

      if (imageFile) {
        const compressedFile = await imageCompression(imageFile, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
        formData.append("image", compressedFile, compressedFile.name);
        formData.append("image_name", compressedFile.name);
      }

      await heimratCreateApplication(formData);
      showNotification("Bewerbung erfolgreich erstellt.", "success");
      setSelectedTenant(null);
      setSelectedDept(null);
      setMotivation("");
      setImageFile(null);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Erstellen der Bewerbung fehlgeschlagen.";
      setError(msg);
      showNotification(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3, p: 2 }}>
      <Typography variant="h6">Bewerbung im Namen eines Mieters erstellen</Typography>
      <Autocomplete
        options={tenants}
        getOptionLabel={(o) => o.label}
        value={selectedTenant}
        onChange={(_, v) => setSelectedTenant(v)}
        renderInput={(params) => <TextField {...params} label="Mieter" required />}
      />
      <Autocomplete
        options={departments}
        getOptionLabel={(o) => o.full_name}
        value={selectedDept}
        onChange={(_, v) => setSelectedDept(v)}
        renderInput={(params) => <TextField {...params} label="Referat" required />}
      />
      <TextField
        label="Motivation"
        multiline
        rows={6}
        value={motivation}
        onChange={(e) => setMotivation(e.target.value)}
        fullWidth
      />
      <Button variant="outlined" component="label">
        Bild hochladen (optional)
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
        />
      </Button>
      {imageFile && <Typography variant="caption">Ausgewählt: {imageFile.name}</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
      <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: "flex-end" }}>
        {isSubmitting ? <CircularProgress size={24} /> : "Bewerbung erstellen"}
      </Button>
    </Box>
  );
};

// --- Application List Component ---
const HeimratApplicationList: React.FC = () => {
  const { showNotification } = useNotification();
  const [applications, setApplications] = useState<EngagementApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; appId: number | null }>({
    open: false,
    appId: null,
  });

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await heimratFetchApplications();
      setApplications(data);
    } catch (err) {
      setError("Bewerbungen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleDelete = async () => {
    if (!deleteConfirm.appId) return;
    try {
      await heimratDeleteApplication(deleteConfirm.appId);
      showNotification("Bewerbung gelöscht.", "success");
      loadApplications();
    } catch (err) {
      showNotification("Löschen fehlgeschlagen.", "error");
    } finally {
      setDeleteConfirm({ open: false, appId: null });
    }
  };

  const columns: GridColDef<EngagementApplicationData>[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "tenantName",
      headerName: "Name",
      width: 200,
      valueGetter: (_, row) => `${row.tenant.name} ${row.tenant.surname}`,
    },
    { field: "departmentName", headerName: "Referat", width: 200, valueGetter: (_, row) => row.department.full_name },
    { field: "motivation", headerName: "Motivation", flex: 1, minWidth: 300 },
    {
      field: "actions",
      type: "actions",
      headerName: "Aktionen",
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Löschen"
          onClick={() => setDeleteConfirm({ open: true, appId: row.id })}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: "100%", p: 1 }}>
      <Button
        component="a"
        href={`${API_BASE_URL}/api/tenants/engagement-applications/pdf/`}
        target="_blank"
        variant="contained"
        startIcon={<DownloadIcon />}
        sx={{ mb: 2 }}
      >
        PDF Herunterladen
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
      <DataGrid
        rows={applications}
        columns={columns}
        loading={loading}
        sx={{ height: "calc(100% - 60px)" }}
        getRowId={(row) => row.id}
      />
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, appId: null })}>
        <DialogTitle>Löschen bestätigen</DialogTitle>
        <DialogContent>
          <DialogContentText>Möchten Sie diese Bewerbung wirklich löschen?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, appId: null })}>Abbrechen</Button>
          <Button onClick={handleDelete} color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// --- Tenant Export Component ---
const HeimratTenantExport: React.FC = () => {
  const { showNotification } = useNotification();
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const floorOptions = ["Alle Stockwerke", ...ALL_FLOORS];

  const handleDownload = async () => {
    if (!selectedFloor) {
      showNotification("Bitte wählen Sie eine Option aus.", "warning");
      return;
    }
    setIsDownloading(true);
    try {
      const params = selectedFloor && selectedFloor !== "Alle Stockwerke" ? { floor: selectedFloor } : {};

      const response = await apiClient.get("/api/engagements/heimrat/export_tenants-csv/", {
        params,
        responseType: "blob", // Important for file downloads
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Create a link to trigger the download
      const link = document.createElement("a");
      link.href = url;

      const floorName = selectedFloor && selectedFloor !== "Alle Stockwerke" ? selectedFloor : "all";
      const timestamp = dayjs().format("YYYY-MM-DD");
      link.setAttribute("download", `bewohnerliste_${floorName}_${timestamp}.csv`);

      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification("Download erfolgreich gestartet.", "success");
    } catch (error) {
      console.error("Failed to download tenant list:", error);
      showNotification("Download fehlgeschlagen. Bitte versuchen Sie es erneut.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3, maxWidth: "500px", margin: "0 auto" }}>
      <Typography variant="h6">Bewohnerliste herunterladen</Typography>
      <Autocomplete
        options={floorOptions}
        value={selectedFloor}
        onChange={(_, newValue) => {
          setSelectedFloor(newValue);
        }}
        renderInput={(params) => <TextField {...params} label="Stockwerk auswählen" />}
      />
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
        disabled={isDownloading || !selectedFloor}
        sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
      >
        {isDownloading ? <CircularProgress size={24} color="inherit" /> : "CSV Herunterladen"}
      </Button>
    </Box>
  );
};

// --- Semester Update Component ---
const UpdateSemesterComponent: React.FC = () => {
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState<GlobalAppSettings | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGlobalSettings().then(setSettings);
  }, []);

  const handleUpdateClick = () => {
    if (selectedSemester && selectedSemester !== settings?.current_semester) {
      setConfirmOpen(true);
    } else {
      showNotification("Bitte ein neues Semester auswählen.", "info");
    }
  };

  const handleConfirmUpdate = async () => {
    if (!selectedSemester) return;
    setIsSubmitting(true);
    try {
      const response = await updateSemesterAndLdap(selectedSemester);
      showNotification(response.message, "success", 8000);
      fetchGlobalSettings().then(setSettings); // Refresh current semester display
    } catch (err: any) {
      const msg = err.response?.data?.error || "Semester-Update fehlgeschlagen.";
      showNotification(msg, "error", 10000);
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
      setSelectedSemester(null);
    }
  };

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Semester wechseln</Typography>
      <Typography variant="body2" color="text.secondary">
        Aktuelles Semester: <strong>{settings?.current_semester || "Laden..."}</strong>
      </Typography>
      <Alert severity="warning">
        <b>Achtung:</b> Führt diese Aktion nur aus wenn alle neuen Referate eingetragen sind. Sie entfernt die
        Berechtigungn für alle Ämter des aktuellen Semesters und fügt sie für alle Ämter des neuen Semesters hinzu.
      </Alert>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Autocomplete
          options={generateSemesterOptions()}
          value={selectedSemester}
          onChange={(_, v) => setSelectedSemester(v)}
          sx={{ flexGrow: 1 }}
          renderInput={(params) => <TextField {...params} label="Neues Semester auswählen" />}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateClick}
          disabled={!selectedSemester || isSubmitting}
        >
          Semester wechseln
        </Button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Bestätigung erforderlich</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bist du sicher, dass du das Semester von <strong>{settings?.current_semester}</strong> auf{" "}
            <strong>{selectedSemester}</strong> ändern möchtest?
            <br />
            <br />
            Es werden alle Berechtigungen für alle Schollheim Anwendungen geupdated.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Abbrechen</Button>
          <Button onClick={handleConfirmUpdate} color="primary" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Ja, bestätigen und wechseln"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// --- Main Page Component ---
const HeimratPage: React.FC = () => {
  const tabs = [
    { label: "Bewerbungen", content: <HeimratApplicationList /> },
    { label: "Bewerbung erstellen", content: <HeimratCreateApplicationForm /> },
    { label: "Download", content: <HeimratTenantExport /> },
    { label: "Einstellungen", content: <HeimratSettings /> },
    { label: "System", content: <UpdateSemesterComponent /> },
  ];

  return (
    <Box sx={{ maxWidth: "1300px", margin: "0 auto" }}>
      <TabbedDashboardCard
        title="Heimrat Verwaltung"
        tabs={tabs}
        cardSx={{ height: "calc(100dvh - 100px)" }}
        contentSx={{ height: "calc(100%)", overflowY: "auto" }}
      />
    </Box>
  );
};

export default HeimratPage;
