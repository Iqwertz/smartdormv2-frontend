import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import ldapRoleService, { LdapGroup, LdapRoleAssignment, LdapUser } from "../../services/ldapRoleService";
import { useNotification } from "../../context/NotificationContext";

/** The backend reports LDAP problems as {"error": "..."} - surface that text if present. */
const errorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err) && err.response?.data?.error) {
    return err.response.data.error;
  }
  return "Ein Fehler ist aufgetreten.";
};

/**
 * Manages LDAP roles that were granted by hand.
 *
 * The nightly sync recalculates every tenant's LDAP groups from their floor and
 * engagements, so a role set directly in LDAP is gone by morning. Recording it here
 * makes the sync treat it as intentional.
 */
const LdapRolesTab: React.FC = () => {
  const [assignments, setAssignments] = useState<LdapRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<LdapUser[]>([]);
  const [groups, setGroups] = useState<LdapGroup[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LdapUser | null>(null);
  // The picked group and the raw text are tracked separately so a manually typed DN
  // counts even when it matches no option and was never confirmed with Enter.
  const [selectedGroup, setSelectedGroup] = useState<LdapGroup | null>(null);
  const [groupInput, setGroupInput] = useState("");
  const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null);
  const [note, setNote] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<LdapRoleAssignment | null>(null);

  const { showNotification } = useNotification();

  const resolvedGroupDn = selectedGroup ? selectedGroup.dn : groupInput.trim();

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      setAssignments(await ldapRoleService.fetchAssignments());
      setError(null);
    } catch {
      setError("Die Rollenzuweisungen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleOpenCreateDialog = async () => {
    setSelectedUser(null);
    setSelectedGroup(null);
    setGroupInput("");
    setExpiresAt(null);
    setNote("");
    setIsDialogOpen(true);

    // Loaded on open rather than with the page: both lists come straight from LDAP.
    try {
      const [ldapUsers, ldapGroups] = await Promise.all([
        ldapRoleService.fetchUsers(),
        ldapRoleService.fetchGroups(),
      ]);
      setUsers(ldapUsers);
      setGroups(ldapGroups);
    } catch {
      showNotification("LDAP-Benutzer und -Gruppen konnten nicht geladen werden.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser || !resolvedGroupDn) return;

    setSaving(true);
    try {
      await ldapRoleService.createAssignment({
        username: selectedUser.username,
        display_name: selectedUser.display_name,
        group_dn: resolvedGroupDn,
        note: note.trim() || null,
        expires_at: expiresAt ? expiresAt.format("YYYY-MM-DD") : null,
      });
      showNotification("Rolle erfolgreich zugewiesen.", "success");
      setIsDialogOpen(false);
      fetchAssignments();
    } catch (err) {
      showNotification(`Zuweisung fehlgeschlagen: ${errorMessage(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (assignment: LdapRoleAssignment) => {
    setAssignmentToDelete(assignment);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteConfirmOpen(false);
    setAssignmentToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;
    try {
      await ldapRoleService.deleteAssignment(assignmentToDelete.id);
      showNotification("Rollenzuweisung entfernt.", "success");
      fetchAssignments();
    } catch (err) {
      showNotification(`Entfernen fehlgeschlagen: ${errorMessage(err)}`, "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const columns: GridColDef<LdapRoleAssignment>[] = [
    {
      field: "display_name",
      headerName: "Benutzer",
      flex: 1,
      minWidth: 200,
      valueGetter: (_value, row) => (row.display_name ? `${row.display_name} (${row.username})` : row.username),
    },
    { field: "group_cn", headerName: "Rolle", width: 160 },
    { field: "group_dn", headerName: "DN", flex: 1, minWidth: 250 },
    { field: "note", headerName: "Kommentar", flex: 1, minWidth: 180 },
    {
      field: "expires_at",
      headerName: "Gültig bis",
      width: 120,
      valueGetter: (_value, row) => (row.expires_at ? dayjs(row.expires_at).format("DD.MM.YYYY") : "unbegrenzt"),
    },
    { field: "created_by", headerName: "Erstellt von", width: 130 },
    {
      field: "created_at",
      headerName: "Erstellt am",
      width: 120,
      valueGetter: (_value, row) => dayjs(row.created_at).format("DD.MM.YYYY"),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Aktionen",
      width: 90,
      cellClassName: "actions",
      getActions: ({ row }) => [
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
          Rolle zuweisen
        </Button>
      </Box>

      <DataGrid
        rows={assignments}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        sx={{ height: "calc(100% - 52px)", border: 0 }}
        autoPageSize
        disableRowSelectionOnClick
      />

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Spezielle LDAP-Rolle zuweisen</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={users}
            value={selectedUser}
            onChange={(_, value) => setSelectedUser(value)}
            getOptionLabel={(option) => `${option.display_name || option.username} (${option.username})`}
            isOptionEqualToValue={(option, value) => option.username === value.username}
            renderInput={(params) => <TextField {...params} label="Benutzer" margin="dense" required />}
          />

          <Autocomplete
            freeSolo
            options={groups}
            value={selectedGroup}
            inputValue={groupInput}
            onChange={(_, value) => {
              if (typeof value === "string") {
                setSelectedGroup(null);
                setGroupInput(value);
              } else {
                setSelectedGroup(value);
                setGroupInput(value ? value.cn : "");
              }
            }}
            onInputChange={(_, value, reason) => {
              if (reason === "input") {
                setSelectedGroup(null);
                setGroupInput(value);
              }
            }}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.cn)}
            renderOption={(props, option) => (
              <li {...props} key={option.dn}>
                <Box>
                  <Typography variant="body2">{option.cn}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.dn}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="LDAP-Rolle"
                margin="dense"
                required
                helperText={
                  resolvedGroupDn
                    ? `DN: ${resolvedGroupDn}`
                    : "Aus der Liste wählen oder einen vollständigen DN eintippen."
                }
              />
            )}
          />

          <DatePicker
            label="Gültig bis (optional)"
            value={expiresAt}
            onChange={(value) => setExpiresAt(value)}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: "dense",
                helperText: "Leer lassen für unbegrenzt. Danach wird die Rolle nachts automatisch entzogen.",
              },
            }}
          />

          <TextField
            fullWidth
            margin="dense"
            multiline
            rows={3}
            label="Kommentar (optional)"
            placeholder="Warum wird diese Rolle vergeben?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedUser || !resolvedGroupDn || saving}
          >
            Zuweisen
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Löschen bestätigen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Soll die Rolle "{assignmentToDelete?.group_cn}" für "{assignmentToDelete?.display_name || assignmentToDelete?.username}"
            wirklich entfernt werden? Die Gruppenmitgliedschaft wird sofort aus LDAP entfernt.
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

export default LdapRolesTab;
