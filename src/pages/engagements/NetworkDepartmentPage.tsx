// src/pages/engagements/NetworkDepartmentPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  DialogContentText,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import apiClient from "../../services/api";
import { useNotification } from "../../context/NotificationContext"; // Assuming this exists
import EventManagementTab from "../../components/networkdepartment/EventManagementTab";

// --- Types ---
interface Department {
  id: number;
  name: string;
  full_name: string;
  points: number;
  size: number;
}

type DepartmentFormData = Omit<Department, "id">;

// --- API Service Functions ---
const fetchDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get<Department[]>("/api/engagements/departments/list/");
  return response.data;
};

const createDepartment = async (data: DepartmentFormData): Promise<Department> => {
  const response = await apiClient.post<Department>("/api/engagements/departments/create/", data);
  return response.data;
};

const updateDepartment = async (id: number, data: Partial<DepartmentFormData>): Promise<Department> => {
  const response = await apiClient.put<Department>(`/api/engagements/departments/${id}/update/`, data);
  return response.data;
};

const deleteDepartment = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/engagements/departments/${id}/delete/`);
};

// --- Management Component ---
const ReferatsManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    full_name: "",
    points: 0,
    size: 1,
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  const { showNotification } = useNotification();

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDepartments();
      setDepartments(data);
    } catch (err) {
      const errorMessage = "Referate konnten nicht geladen werden.";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setCurrentDepartment(null);
    setFormData({ name: "", full_name: "", points: 0, size: 1 });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (department: Department) => {
    setIsEditMode(true);
    setCurrentDepartment(department);
    setFormData({
      name: department.name,
      full_name: department.full_name,
      points: department.points,
      size: department.size,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "points" || name === "size" ? Number(value) || 0 : value,
    }));
  };

  const handleFormSubmit = async () => {
    try {
      if (isEditMode && currentDepartment) {
        await updateDepartment(currentDepartment.id, formData);
        showNotification("Referat erfolgreich aktualisiert.", "success");
      } else {
        await createDepartment(formData);
        showNotification("Referat erfolgreich erstellt.", "success");
      }
      handleCloseDialog();
      loadDepartments();
    } catch (err: any) {
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Ein Fehler ist aufgetreten.";
      showNotification(`Speichern fehlgeschlagen: ${errorMsg}`, "error");
    }
  };

  const handleOpenDeleteDialog = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteConfirmOpen(false);
    setDepartmentToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;
    try {
      await deleteDepartment(departmentToDelete.id);
      showNotification("Referat erfolgreich gelöscht.", "success");
      handleCloseDeleteDialog();
      loadDepartments();
    } catch (err) {
      showNotification("Löschen fehlgeschlagen.", "error");
    }
  };

  const columns: GridColDef<Department>[] = [
    { field: "name", headerName: "Name (Kurz)", width: 150 },
    { field: "full_name", headerName: "Vollständiger Name", flex: 1, minWidth: 250 },
    { field: "points", headerName: "Punkte", type: "number", width: 110 },
    { field: "size", headerName: "Plätze", type: "number", width: 110 },
    {
      field: "actions",
      type: "actions",
      headerName: "Aktionen",
      width: 100,
      cellClassName: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Bearbeiten" onClick={() => handleOpenEditDialog(row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Löschen" onClick={() => handleOpenDeleteDialog(row)} />,
      ],
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
          Neues Referat
        </Button>
      </Box>
      <DataGrid
        rows={departments}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        sx={{ height: "calc(100% - 52px)", border: 0 }}
        autoPageSize
      />

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? "Referat bearbeiten" : "Neues Referat erstellen"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name (Kurz)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="full_name"
            label="Vollständiger Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.full_name}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="points"
            label="Punkte"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.points}
            onChange={handleFormChange}
            inputProps={{ min: 0 }}
          />
          <TextField
            margin="dense"
            name="size"
            label="Plätze"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.size}
            onChange={handleFormChange}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleFormSubmit} variant="contained">
            {isEditMode ? "Speichern" : "Erstellen"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Löschen bestätigen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie das Referat "{departmentToDelete?.full_name}" wirklich löschen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Abbrechen</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// --- Page Component ---
const NetworkDepartmentPage: React.FC = () => {
  const tabs = [
    {
      label: "Referate verwalten",
      content: <ReferatsManagement />,
    },
    {
      label: "Anwesenheits Events",
      content: <EventManagementTab />,
    },
  ];

  return (
    <Box sx={{ maxWidth: "1600px", margin: "0 auto" }} className="page-root">
      <TabbedDashboardCard
        title="Netzwerkreferat"
        tabs={tabs}
        cardSx={{
          height: "calc(100vh - 64px - 3rem - 16px)",
        }}
        contentSx={{ height: "calc(100% - 48px)", padding: 2, overflowY: "hidden" }}
      />
    </Box>
  );
};

export default NetworkDepartmentPage;
