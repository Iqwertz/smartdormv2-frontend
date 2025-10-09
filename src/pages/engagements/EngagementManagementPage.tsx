import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Autocomplete,
  TextField,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem, GridCheckIcon } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import { useNotification } from "../../context/NotificationContext";
import { AdminEngagement, DepartmentForSelect, EngagementCreatePayload } from "../../types/tenant";
import { TenantForSelect } from "../../types/parcel";
import { fetchRecipientsForSelect } from "../../services/parcelService";
import {
  fetchDepartmentsForSelect,
  fetchEngagementsAdmin,
  createEngagementAdmin,
  updateEngagementPoints,
  deleteEngagementAdmin,
  compensateAllEngagements,
  compensateEngagement,
} from "../../services/engagementService";
import { GridToolbar } from "@mui/x-data-grid/internals";
import Tooltip from "@mui/material/Tooltip";

// Helper to generate semester options
const generateSemesterOptions = (): string[] => {
  const currentYear = new Date().getFullYear();
  const shortYear = currentYear % 100;
  const semesters: string[] = [];
  for (let i = 12; i >= -1; i--) {
    const year = shortYear - i;
    semesters.push(`WS${year}/${(year + 1).toString().padStart(2, "0")}`);
    semesters.push(`SS${year}`);
  }
  return semesters.reverse();
};

const CreateEngagementForm: React.FC<{ onEngagementCreated: () => void }> = ({ onEngagementCreated }) => {
  const { showNotification } = useNotification();
  const [tenants, setTenants] = useState<TenantForSelect[]>([]);
  const [departments, setDepartments] = useState<DepartmentForSelect[]>([]);
  const [formData, setFormData] = useState<Partial<EngagementCreatePayload>>({ compensate: false });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchRecipientsForSelect("tenants"), fetchDepartmentsForSelect()])
      .then(([tenantsData, deptsData]) => {
        setTenants(tenantsData);
        setDepartments(deptsData);
      })
      .catch(() => showNotification("Konnte Mieter oder Referate nicht laden.", "error"))
      .finally(() => setLoading(false));
  }, [showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenant_id || !formData.department_id || !formData.semester) {
      showNotification("Bitte alle Felder ausfüllen.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await createEngagementAdmin(formData as EngagementCreatePayload);
      showNotification("Amt erfolgreich erstellt.", "success");
      setFormData({ compensate: false });
      onEngagementCreated(); // Trigger refresh in parent
    } catch (err) {
      showNotification("Erstellen fehlgeschlagen.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3, p: 2 }}>
      <Autocomplete
        options={tenants}
        getOptionLabel={(o) => o.label}
        onChange={(_, v) => setFormData((p) => ({ ...p, tenant_id: v ? parseInt(v.id) : undefined }))}
        renderInput={(params) => <TextField {...params} label="Mieter" required />}
      />
      <Autocomplete
        options={departments}
        getOptionLabel={(o) => o.full_name}
        onChange={(_, v) => setFormData((p) => ({ ...p, department_id: v ? v.id : undefined }))}
        renderInput={(params) => <TextField {...params} label="Referat" required />}
      />
      <Autocomplete
        options={generateSemesterOptions()}
        onChange={(_, v) => setFormData((p) => ({ ...p, semester: v || undefined }))}
        renderInput={(params) => <TextField {...params} label="Semester" required />}
      />
      <TextField
        label="Notiz (optional)"
        multiline
        rows={3}
        onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.compensate}
            onChange={(e) => setFormData((p) => ({ ...p, compensate: e.target.checked }))}
          />
        }
        label="Sofort entlasten"
      />
      <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: "flex-end" }}>
        {isSubmitting ? <CircularProgress size={24} /> : "Amt erstellen"}
      </Button>
    </Box>
  );
};

// --- Engagement List Component ---
const EngagementList: React.FC<{ compensated: boolean; refreshKey: number; onDataModified: () => void }> = ({
  compensated,
  refreshKey,
  onDataModified,
}) => {
  const { showNotification } = useNotification();
  const [engagements, setEngagements] = useState<AdminEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editState, setEditState] = useState<{ open: boolean; engagement: AdminEngagement | null; points: string }>({
    open: false,
    engagement: null,
    points: "",
  });
  const [deleteState, setDeleteState] = useState<{ open: boolean; engagementId: number | null }>({
    open: false,
    engagementId: null,
  });

  const loadEngagements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEngagementsAdmin(compensated);
      setEngagements(data);
    } catch {
      showNotification("Ämter konnten nicht geladen werden.", "error");
    } finally {
      setLoading(false);
    }
  }, [compensated, showNotification]);

  useEffect(() => {
    loadEngagements();
  }, [loadEngagements, refreshKey]);

  const handleEditClick = (engagement: AdminEngagement) =>
    setEditState({ open: true, engagement, points: engagement.points.toString() });
  const handleDeleteClick = (engagementId: number) => setDeleteState({ open: true, engagementId });
  const handleCompensateClick = async (engagement: AdminEngagement) => {
    try {
      const res = await compensateEngagement(engagement.id);
      showNotification(res.message, "success");
      onDataModified();
    } catch {
      showNotification("Entlastung fehlgeschlagen.", "error");
    }
  };

  const handleSavePoints = async () => {
    if (!editState.engagement) return;
    try {
      await updateEngagementPoints(editState.engagement.id, parseFloat(editState.points));
      showNotification("Punkte aktualisiert.", "success");
      setEditState({ open: false, engagement: null, points: "" });
      onDataModified();
    } catch {
      showNotification("Update fehlgeschlagen.", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState.engagementId) return;
    try {
      await deleteEngagementAdmin(deleteState.engagementId);
      showNotification("Amt gelöscht.", "success");
      setDeleteState({ open: false, engagementId: null });
      onDataModified();
    } catch {
      showNotification("Löschen fehlgeschlagen.", "error");
    }
  };

  const columns: GridColDef<AdminEngagement>[] = [
    { field: "departmentName", headerName: "Referat", width: 150, valueGetter: (_, row) => row.department.full_name },
    { field: "semester", headerName: "Semester", width: 100 },
    {
      field: "tenantName",
      headerName: "Name",
      width: 180,
      valueGetter: (_, row) => `${row.tenant.name} ${row.tenant.surname}`,
    },
    { field: "tenantEmail", headerName: "Email", width: 200, valueGetter: (_, row) => row.tenant.email },
    { field: "tenantRoom", headerName: "Zimmer", width: 80, valueGetter: (_, row) => row.tenant.current_room },
    { field: "points", headerName: "Punkte", width: 80, type: "number" },
    { field: "note", headerName: "Notiz", flex: 1, minWidth: 150 },
    {
      field: "actions",
      type: "actions",
      headerName: "Aktionen",
      width: 130,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Punkte bearbeiten" onClick={() => handleEditClick(row)} />,
        <Tooltip title={compensated ? "Entlastung rückgängig" : "Entlasten"}>
          <GridActionsCellItem
            icon={compensated ? <UndoIcon /> : <GridCheckIcon />}
            label={compensated ? "Entlastung rückgängig" : "Entlasten"}
            onClick={() => handleCompensateClick(row)}
          />
        </Tooltip>,
        <GridActionsCellItem icon={<DeleteIcon />} label="Löschen" onClick={() => handleDeleteClick(row.id)} />,
      ],
    },
  ];

  return (
    <Box sx={{ height: "100%", p: 1 }}>
      <DataGrid
        rows={engagements}
        columns={columns}
        loading={loading}
        sx={{ height: "100%" }}
        slots={{ toolbar: GridToolbar }}
        showToolbar
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
      />

      <Dialog open={editState.open} onClose={() => setEditState({ ...editState, open: false })}>
        <DialogTitle>Punkte bearbeiten</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Punkte für {editState.engagement?.tenant.name} {editState.engagement?.tenant.surname} im Amt{" "}
            {editState.engagement?.department.name} bearbeiten.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Punkte"
            type="number"
            fullWidth
            variant="standard"
            value={editState.points}
            onChange={(e) => setEditState((p) => ({ ...p, points: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditState({ ...editState, open: false })}>Abbrechen</Button>
          <Button onClick={handleSavePoints}>Speichern</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteState.open} onClose={() => setDeleteState({ ...deleteState, open: false })}>
        <DialogTitle>Löschen bestätigen</DialogTitle>
        <DialogContent>
          <DialogContentText>Möchten Sie dieses Amt wirklich löschen?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ ...deleteState, open: false })}>Abbrechen</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// --- Main Page Component ---
const EngagementManagementPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger data refetch in child components

  const handleDataModified = () => setRefreshKey((prev) => prev + 1);

  const handleCompensateAll = async () => {
    try {
      const res = await compensateAllEngagements();
      showNotification(res.message, "success");
      handleDataModified();
    } catch {
      showNotification("Entlastung aller Ämter fehlgeschlagen.", "error");
    }
  };

  const uncompensatedTabContent = (
    <Box>
      <Button onClick={handleCompensateAll} variant="contained" sx={{ m: 2 }}>
        Alle Ämter entlasten
      </Button>
      <EngagementList compensated={false} refreshKey={refreshKey} onDataModified={handleDataModified} />
    </Box>
  );

  const tabs = [
    { label: "Neues Amt", content: <CreateEngagementForm onEngagementCreated={handleDataModified} /> },
    { label: "Nicht Entlastete Ämter", content: uncompensatedTabContent },
    {
      label: "Entlastete Ämter",
      content: <EngagementList compensated={true} refreshKey={refreshKey} onDataModified={handleDataModified} />,
    },
  ];

  return (
    <Box sx={{ maxWidth: "1600px", margin: "0 auto" }}>
      <TabbedDashboardCard
        title="Referate verwalten"
        tabs={tabs}
        cardSx={{ height: "calc(100vh - 64px - 3rem - 16px)" }}
        contentSx={{ height: "calc(100% - 40px)", overflowY: "auto" }}
      />
    </Box>
  );
};

export default EngagementManagementPage;
