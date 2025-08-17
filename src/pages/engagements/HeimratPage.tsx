import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Autocomplete,
  Avatar,
  Paper,
  Grid,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import {
  GlobalAppSettings,
  EngagementApplicationData,
  DepartmentForSelect,
  MyEngagementApplication,
} from "../../types/tenant";
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
        const compressedFile = await imageCompression(imageFile, { maxSizeMB: 1, maxWidthOrHeight: 1024 });
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
        href={`${API_BASE_URL}/api/engagements/heimrat/applications/`}
        target="_blank"
        variant="contained"
        startIcon={<DownloadIcon />}
        sx={{ mb: 2 }}
      >
        PDF Herunterladen
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
      <DataGrid rows={applications} columns={columns} loading={loading} autoHeight getRowId={(row) => row.id} />
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

// --- Main Page Component ---
const HeimratPage: React.FC = () => {
  const tabs = [
    { label: "Bewerbungen", content: <HeimratApplicationList /> },
    { label: "Bewerbung erstellen", content: <HeimratCreateApplicationForm /> },
    { label: "Einstellungen", content: <HeimratSettings /> },
  ];

  return (
    <Box sx={{ maxWidth: "1300px", margin: "0 auto" }}>
      <TabbedDashboardCard
        title="Heimrat Verwaltung"
        tabs={tabs}
        cardSx={{ height: "calc(100vh - 64px - 3rem - 16px)" }}
        contentSx={{ height: "calc(100% - 40px)", overflowY: "auto" }}
      />
    </Box>
  );
};

export default HeimratPage;
