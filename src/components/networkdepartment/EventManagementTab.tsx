import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  DialogContentText,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import attendanceService, { AttendanceEvent } from "../../services/attendanceService";
import { useNotification } from "../../context/NotificationContext";

const EventManagementTab: React.FC = () => {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<AttendanceEvent | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    parts_count: 1,
    required_parts: 1,
    admin_groups: "ADMIN",
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<AttendanceEvent | null>(null);

  const { showNotification } = useNotification();

  const fetchEvents = () => {
    setLoading(true);
    attendanceService
      .getEvents()
      .then((res) => setEvents(res.data))
      .catch((err) => {
        showNotification("Events konnten nicht geladen werden.", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setCurrentEvent(null);
    setFormData({ name: "", parts_count: 1, required_parts: 1, admin_groups: "ADMIN" });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (evt: AttendanceEvent) => {
    setIsEditMode(true);
    setCurrentEvent(evt);
    setFormData({
      name: evt.name,
      parts_count: evt.parts_count,
      required_parts: evt.required_parts,
      admin_groups: evt.admin_groups.join(", "),
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "parts_count" || name === "required_parts" ? parseInt(value) || 0 : value,
    }));
  };

  const handleFormSubmit = async () => {
    const payload = {
      ...formData,
      admin_groups: formData.admin_groups
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g),
    };

    try {
      if (isEditMode && currentEvent) {
        await attendanceService.updateEvent(currentEvent.id, payload);
        showNotification("Event erfolgreich aktualisiert.", "success");
      } else {
        await attendanceService.createEvent(payload);
        showNotification("Event erfolgreich erstellt.", "success");
      }
      setIsDialogOpen(false);
      fetchEvents();
    } catch (err: any) {
      showNotification("Fehler beim Speichern des Events.", "error");
    }
  };

  const handleOpenDeleteDialog = (evt: AttendanceEvent) => {
    setEventToDelete(evt);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    try {
      await attendanceService.deleteEvent(eventToDelete.id);
      showNotification("Event erfolgreich gelöscht.", "success");
      fetchEvents();
    } catch (err) {
      showNotification("Event konnte nicht gelöscht werden.", "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const columns: GridColDef<AttendanceEvent>[] = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
    { field: "parts_count", headerName: "Anzahl an tracking checkpoints", type: "number", width: 130 },
    { field: "required_parts", headerName: "Benötigte tracking checkpoints", type: "number", width: 150 },
    {
      field: "admin_groups",
      headerName: "Admin Gruppen",
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) => (row.admin_groups ? row.admin_groups.join(", ") : ""),
    },
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

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
          Neues Event (Typ)
        </Button>
      </Box>

      <DataGrid
        rows={events}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        sx={{ height: "calc(100% - 52px)", border: 0 }}
        autoPageSize
        disableRowSelectionOnClick
      />

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? "Anwesenheits Event (Typ) bearbeiten" : "Anwesenheits Event erstellen"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            name="name"
            label="Name des Events"
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            margin="dense"
            name="parts_count"
            label="Wie oft wird die Anwesenheit kontrolliert?"
            variant="outlined"
            type="number"
            value={formData.parts_count}
            onChange={handleFormChange}
            inputProps={{ min: 1 }}
          />
          <TextField
            fullWidth
            margin="dense"
            name="required_parts"
            label="Wie oft muss man anwesend sein, um als anwesend zu gelten?"
            variant="outlined"
            type="number"
            value={formData.required_parts}
            onChange={handleFormChange}
            inputProps={{ min: 1 }}
          />
          <TextField
            fullWidth
            margin="dense"
            name="admin_groups"
            label="Berechtigungen (Zuständige für das Event z.B. Heimrat, ADMIN)"
            variant="outlined"
            value={formData.admin_groups}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button variant="contained" onClick={handleFormSubmit}>
            {isEditMode ? "Speichern" : "Erstellen"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Event löschen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchtest du das Event "{eventToDelete?.name}" und alle zugehörigen Sessions und Anwesenheiten wirklich
            löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Abbrechen</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManagementTab;
