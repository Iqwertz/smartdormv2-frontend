// src/pages/admin/EditTenantPage.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Grid,
  Autocomplete,
  Typography,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Stack
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import DashboardCard from "../../components/shared/DashboardCard";
import { useNotification } from "../../context/NotificationContext";
import { 
  TenantProfile, 
  Subtenant, 
  Rental, 
  MovePayload, 
  Termination, 
  DepartmentExtension 
} from "../../types/tenant";
import apiClient from "../../services/api";
import dayjs, { Dayjs } from "dayjs";
import { nationalities } from "../../utils/nationalities";
import { universities } from "../../utils/universities";

interface SelectOption {
  id: number;
  label: string;
}

const EditTenantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Component State
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [subtenants, setSubtenants] = useState<Subtenant[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [allRooms, setAllRooms] = useState<SelectOption[]>([]);
  
  // New State for Termination and Extensions
  const [termination, setTermination] = useState<Termination | null>(null);
  const [departmentExtensions, setDepartmentExtensions] = useState<DepartmentExtension[]>([]);

  // Move Form State
  const [moveData, setMoveData] = useState<{ room_id: number | null; move_date: Dayjs | null }>({
    room_id: null,
    move_date: null,
  });

  // Termination Form State
  const [terminationForm, setTerminationForm] = useState<{ date: Dayjs | null; note: string }>({
    date: null,
    note: "",
  });

  // Department Extension Form State
  const [extensionForm, setExtensionForm] = useState<{ months: string; note: string }>({
    months: "",
    note: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  
  const [isTerminating, setIsTerminating] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchTenantData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Fetch base data
      const [tenantRes, subtenantsRes, rentalsRes, roomsRes, extensionsRes] = await Promise.all([
        apiClient.get(`/api/department/tenant-data/${id}/`),
        apiClient.get(`/api/department/tenant-data/${id}/subtenants/`),
        apiClient.get(`/api/department/tenant-data/${id}/rentals/`),
        apiClient.get("/api/common/room-list/"),
        apiClient.get(`/api/department/tenant-data/${id}/department-extensions/`),
      ]);

      setTenant(tenantRes.data);
      setSubtenants(subtenantsRes.data);
      setRentals(rentalsRes.data);
      setAllRooms(roomsRes.data);
      setDepartmentExtensions(extensionsRes.data);

      // Fetch termination separately
      try {
        const termRes = await apiClient.get(`/api/department/tenant-data/${id}/termination/`);
        setTermination(termRes.data);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setTermination(null);
        } else {
          console.error("Error fetching termination status", err);
        }
      }

    } catch (err) {
      setError("Bewohnerdaten konnten nicht geladen werden.");
      showNotification("Bewohnerdaten konnten nicht geladen werden.", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showNotification]);

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  // Form Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!tenant) return;
    setTenant({ ...tenant, [e.target.name]: e.target.value });
  };
  const handleSelectChange = (e: any) => {
    if (!tenant) return;
    setTenant({ ...tenant, [e.target.name]: e.target.value });
  };
  const handleDateChange = (name: keyof TenantProfile, date: Dayjs | null) => {
    if (!tenant) return;
    setTenant({ ...tenant, [name]: date ? date.format("YYYY-MM-DD") : "" });
  };
  const handleAutocompleteChange = (name: keyof TenantProfile, value: string | null) => {
    if (!tenant) return;
    setTenant({ ...tenant, [name]: value || "" });
  };

  // --- ACTIONS ---

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.put(`/api/department/tenant-data/${id}/update/`, tenant);
      showNotification("Daten erfolgreich aktualisiert.", "success");
      fetchTenantData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Update fehlgeschlagen.";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/api/department/tenant-data/${id}/delete/`);
      showNotification("Bewohner erfolgreich gelöscht.", "success");
      navigate("/department/overview");
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Löschen fehlgeschlagen.";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !moveData.room_id || !moveData.move_date) {
      showNotification("Bitte neues Zimmer und Umzugsdatum auswählen.", "warning");
      return;
    }
    setIsMoving(true);
    const payload: MovePayload = {
      room_id: moveData.room_id,
      move_date: moveData.move_date.format("YYYY-MM-DD"),
    };
    try {
      await apiClient.post(`/api/department/tenant-data/${id}/move/`, payload);
      showNotification("Bewohner erfolgreich umgezogen.", "success");
      setMoveData({ room_id: null, move_date: null });
      fetchTenantData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Umzug fehlgeschlagen.";
      showNotification(errorMessage, "error");
    } finally {
      setIsMoving(false);
    }
  };

  // --- Termination Logic ---

  const handleCreateTermination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !terminationForm.date) {
      showNotification("Bitte Auszugsdatum auswählen.", "warning");
      return;
    }
    setIsTerminating(true);
    const payload = {
      move_out_date: terminationForm.date.format("YYYY-MM-DD"),
      note: terminationForm.note,
    };
    try {
      await apiClient.post(`/api/department/tenant-data/${id}/terminate/`, payload);
      showNotification("Bewohner erfolgreich gekündigt.", "success");
      setTerminationForm({ date: null, note: "" });
      fetchTenantData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Kündigung fehlgeschlagen.";
      showNotification(errorMessage, "error");
    } finally {
      setIsTerminating(false);
    }
  };

  const handleRevokeTermination = async () => {
    if (!id) return;
    setIsTerminating(true);
    try {
      await apiClient.delete(`/api/department/tenant-data/${id}/termination/`);
      showNotification("Kündigung erfolgreich aufgehoben.", "success");
      setTermination(null);
      fetchTenantData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Aufheben fehlgeschlagen.";
      showNotification(errorMessage, "error");
    } finally {
      setIsTerminating(false);
    }
  };

  // --- Department Extension Logic ---

  const handleCreateExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !extensionForm.months) {
      showNotification("Bitte Monate angeben.", "warning");
      return;
    }
    setIsExtending(true);
    try {
      const payload = {
        tenant_id: parseInt(id),
        months: parseInt(extensionForm.months),
        note: extensionForm.note,
      };
      await apiClient.post(`/api/department/department-extensions/create/`, payload);
      showNotification("Verlängerung erfolgreich erstellt.", "success");
      setExtensionForm({ months: "", note: "" });
      fetchTenantData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Erstellen fehlgeschlagen.";
      showNotification(errorMessage, "error");
    } finally {
      setIsExtending(false);
    }
  };

  const handleDeleteExtension = async (extId: number) => {
    setIsExtending(true);
    try {
      await apiClient.delete(`/api/department/department-extensions/${extId}/`);
      showNotification("Verlängerung gelöscht.", "success");
      fetchTenantData();
    } catch (err: any) {
      showNotification("Löschen fehlgeschlagen.", "error");
    } finally {
      setIsExtending(false);
    }
  };

  const handleDeleteRental = async (rentalId: number) => {
    try {
      await apiClient.delete(`/api/department/rentals/${rentalId}/delete/`);
      showNotification("Vermietung gelöscht.", "success");
      fetchTenantData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Löschen fehlgeschlagen.";
      showNotification(errorMessage, "error");
    }
  };

  if (loading) return <CircularProgress />;
  if (error && !tenant) return <Alert severity="error">{error}</Alert>;
  if (!tenant) return <Alert severity="info">Kein Bewohner ausgewählt.</Alert>;

  return (
    <>
      <Box
        sx={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 2 }}
        className="page-root"
      >
        <DashboardCard title={`Bewohner bearbeiten: ${tenant.name} ${tenant.surname}`}>
          <Box component="form" onSubmit={handleUpdate} noValidate>
            <Typography variant="h6" gutterBottom>
              Persönliche Daten
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="name"
                  label="Vorname"
                  value={tenant.name || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="surname"
                  label="Nachname"
                  value={tenant.surname || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="email"
                  label="E-Mail"
                  type="email"
                  value={tenant.email || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required sx={{ minWidth: 200 }}>
                  <InputLabel>Geschlecht</InputLabel>
                  <Select name="gender" value={tenant.gender || ""} label="Geschlecht" onChange={handleSelectChange}>
                    <MenuItem value="FEMALE">FEMALE</MenuItem>
                    <MenuItem value="MALE">MALE</MenuItem>
                    <MenuItem value="DIVERSE">DIVERSE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Geburtstag"
                  value={tenant.birthday ? dayjs(tenant.birthday) : null}
                  onChange={(d) => handleDateChange("birthday", d)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  sx={{ minWidth: 200 }}
                  options={nationalities}
                  value={tenant.nationality || ""}
                  onChange={(_, v) => handleAutocompleteChange("nationality", v)}
                  renderInput={(params) => <TextField {...params} label="Staatsangehörigkeit" required fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="tel_number"
                  label="Telefonnummer"
                  value={tenant.tel_number || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField name="points" label="Punkte" value={tenant.current_points || ""} disabled fullWidth />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Vertragsdetails
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DatePicker
                  label="Einzugsdatum"
                  value={dayjs(tenant.move_in)}
                  disabled
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Zimmer" value={tenant.current_room || ""} disabled fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DatePicker
                  label="Auszugsdatum (Berechnet)"
                  value={dayjs(tenant.move_out)}
                  onChange={(d) => handleDateChange("move_out", d)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      helperText: "Wird automatisch berechnet. Für Änderungen nutzen Sie Verlängerungen oder Kündigung." 
                    } 
                  }}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="deposit"
                  label="Kaution (€)"
                  type="number"
                  value={tenant.deposit || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DatePicker
                  label="Probezeitende"
                  value={dayjs(tenant.probation_end)}
                  onChange={(d) => handleDateChange("probation_end", d)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                 {/* Added Extension Count Field */}
                 <TextField
                  label="Verlängerungen"
                  type="number"
                  value={tenant.extension ?? 0}
                  disabled
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Studiendetails & Notizen
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required sx={{ minWidth: 300 }}>
                  <InputLabel>Hochschule</InputLabel>
                  <Select
                    name="university"
                    value={tenant.university || ""}
                    label="Hochschule"
                    onChange={handleSelectChange}
                  >
                    {universities.map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="study_field"
                  label="Studienfach"
                  value={tenant.study_field || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="note"
                  label="Notiz"
                  multiline
                  rows={3}
                  value={tenant.note || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button
                color="error"
                variant="outlined"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={isSubmitting}
              >
                Bewohner löschen
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : "Änderungen speichern"}
              </Button>
            </Box>
          </Box>
        </DashboardCard>

        {/* --- Department Extensions Section --- */}
        <DashboardCard title="Verwaltungs Verlängerungen">
          <Box sx={{ p: 2 }}>
             {/* List existing extensions */}
             {departmentExtensions.length > 0 ? (
                <List dense>
                  {departmentExtensions.map((ext) => (
                    <ListItem
                      key={ext.id}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => handleDeleteExtension(ext.id)}
                          disabled={isExtending}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                      sx={{ borderBottom: '1px solid #eee' }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip 
                              label={`${ext.months > 0 ? '+' : ''}${ext.months} Monat(e)`} 
                              color={ext.months > 0 ? "success" : "warning"}
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="body2">{ext.note}</Typography>
                          </Box>
                        }
                        secondary={`Erstellt am: ${dayjs(ext.created_at).format("DD.MM.YYYY")}`}
                      />
                    </ListItem>
                  ))}
                </List>
             ) : (
               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                 Keine manuellen Verlängerungen vorhanden.
               </Typography>
             )}

             <Divider sx={{ my: 2 }} />
             
             {/* Create new extension form */}
             <Typography variant="subtitle2" gutterBottom>Neue Verlängerung hinzufügen</Typography>
             <Box component="form" onSubmit={handleCreateExtension} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
               <TextField
                 label="Monate (+/-)"
                 type="number"
                 value={extensionForm.months}
                 onChange={(e) => setExtensionForm(prev => ({ ...prev, months: e.target.value }))}
                 required
                 sx={{ width: 120 }}
               />
               <TextField
                 label="Begründung / Notiz"
                 value={extensionForm.note}
                 onChange={(e) => setExtensionForm(prev => ({ ...prev, note: e.target.value }))}
                 required
                 fullWidth
               />
               <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={isExtending}
                  startIcon={<AddIcon />}
                  sx={{ whiteSpace: 'nowrap', mt: 0.5 }}
                >
                  Hinzufügen
               </Button>
             </Box>
          </Box>
        </DashboardCard>



        {/* Subtenants Section */}
        <DashboardCard title="Untermieter">
          {subtenants.length > 0 ? (
            <List>
              {subtenants.map((sub) => (
                <ListItem
                  key={sub.id}
                  secondaryAction={
                    <Button onClick={() => navigate(`/department/edit-subtenant/${sub.id}`)} size="small">
                      Bearbeiten
                    </Button>
                  }
                >
                  <ListItemText
                    primary={`${sub.name} ${sub.surname}`}
                    secondary={
                      <Stack direction="column" spacing={0.5}>
                        <Typography variant="body2" component="span">
                           Untermieter vom {dayjs(sub.move_in).format("DD.MM.YYYY")} bis {dayjs(sub.move_out).format("DD.MM.YYYY")}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                           {sub.university_confirmation ? (
                             <Chip 
                               icon={<CheckCircleOutlineIcon />} 
                               label="Partner-Uni bestätigt" 
                               color="success" 
                               size="small" 
                               variant="outlined" 
                             />
                           ) : (
                             <Chip 
                               icon={<HighlightOffIcon />} 
                               label="Keine Bestätigung" 
                               color="error" 
                               size="small" 
                               variant="outlined" 
                             />
                           )}
                        </Stack>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ p: 2, textAlign: "center" }} color="text.secondary">
              Keine Untermieter für diesen Bewohner erfasst.
            </Typography>
          )}
        </DashboardCard>

        {/* Move History Section */}
        <DashboardCard title="Vermietungen">
          {rentals.length > 0 ? (
            <List dense>
              {rentals
                .sort((a, b) => dayjs(b.move_in).valueOf() - dayjs(a.move_in).valueOf())
                .map((rental, index) => {
                  const isCurrentRoom = index === 0;
                  return (
                    <ListItem
                      key={rental.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteRental(rental.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`Zimmer ${rental.room_name}${isCurrentRoom ? " (Aktuell)" : ""}`}
                        secondary={
                          isCurrentRoom
                            ? `Eingezogen am ${dayjs(rental.move_in).format("DD.MM.YYYY")}`
                            : `Vom ${dayjs(rental.move_in).format("DD.MM.YYYY")} bis ${dayjs(rental.moved_out).format(
                                "DD.MM.YYYY"
                              )}`
                        }
                      />
                    </ListItem>
                  );
                })}
            </List>
          ) : (
            <Typography sx={{ p: 2, textAlign: "center" }} color="text.secondary">
              Keine Umzugshistorie vorhanden.
            </Typography>
          )}
        </DashboardCard>

        {/* Perform Move Section */}
        <DashboardCard title="Umzug durchführen">
          <Box component="form" onSubmit={handleMove} noValidate sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  sx={{ minWidth: 300 }}
                  options={allRooms.filter((r) => r.label !== tenant.current_room)}
                  getOptionLabel={(option) => option.label}
                  value={allRooms.find((r) => r.id === moveData.room_id) || null}
                  onChange={(_, newValue) => setMoveData((prev) => ({ ...prev, room_id: newValue?.id || null }))}
                  renderInput={(params) => <TextField {...params} label="Neues Zimmer" required fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DatePicker
                  label="Umzugsdatum"
                  value={moveData.move_date}
                  onChange={(date) => setMoveData((prev) => ({ ...prev, move_date: date }))}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Button type="submit" variant="contained" fullWidth disabled={isMoving}>
                  {isMoving ? <CircularProgress size={24} /> : "Umziehen"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DashboardCard>

                {/* --- Termination Section --- */}
        <DashboardCard title="Kündigen">
          <Box sx={{ p: 2 }}>
            {termination ? (
              // View / Delete existing termination
              <Alert 
                severity="warning" 
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleRevokeTermination}
                    disabled={isTerminating}
                  >
                    Kündigung aufheben
                  </Button>
                }
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Vertrag gekündigt zum {dayjs(termination.date).format("DD.MM.YYYY")}
                </Typography>
                <Typography variant="body2">
                  Grund: {termination.note || "Keine Notiz"}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Erstellt am {dayjs(termination.created_at).format("DD.MM.YYYY HH:mm")}
                </Typography>
              </Alert>
            ) : (
              // Create new termination
              <Box component="form" onSubmit={handleCreateTermination} noValidate>
                 <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <DatePicker
                      label="Auszugsdatum (Vertragsende)"
                      value={terminationForm.date}
                      onChange={(date) => setTerminationForm((prev) => ({ ...prev, date }))}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Kündigungsgrund / Notiz"
                      value={terminationForm.note}
                      onChange={(e) => setTerminationForm((prev) => ({ ...prev, note: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="error" 
                      fullWidth 
                      disabled={isTerminating}
                    >
                      {isTerminating ? <CircularProgress size={24} /> : "Kündigen"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DashboardCard>

      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Löschen bestätigen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie den Bewohner {tenant.name} {tenant.surname} wirklich endgültig löschen? Diese Aktion kann nicht
            rückgängig gemacht werden und entfernt auch den zugehörigen Account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDelete} color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditTenantPage;