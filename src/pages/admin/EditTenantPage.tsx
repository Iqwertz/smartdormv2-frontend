import React, { useState, useEffect } from "react";
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
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DashboardCard from "../../components/tenants/dashboard/DashboardCard";
import { useNotification } from "../../context/NotificationContext";
import { TenantProfile, Subtenant } from "../../types/tenant";
import apiClient from "../../services/api";
import dayjs, { Dayjs } from "dayjs";
import { nationalities } from "../../utils/nationalities";
import { universities } from "../../utils/universities";

const EditTenantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [subtenants, setSubtenants] = useState<Subtenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [tenantRes, subtenantsRes] = await Promise.all([
          apiClient.get(`/api/department/tenant-data/${id}/`),
          apiClient.get(`/api/department/tenant-data/${id}/subtenants/`),
        ]);
        setTenant(tenantRes.data);
        setSubtenants(subtenantsRes.data);
      } catch (err) {
        setError("Bewohnerdaten konnten nicht geladen werden.");
        showNotification("Bewohnerdaten konnten nicht geladen werden.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTenantData();
  }, [id, showNotification]);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.put(`/api/department/tenant-data/${id}/update/`, tenant);
      showNotification("Daten erfolgreich aktualisiert.", "success");
      // Optionally, you can navigate back to the overview page
      navigate("/department/overview");
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

  if (loading) return <CircularProgress />;
  if (error && !tenant) return <Alert severity="error">{error}</Alert>;
  if (!tenant) return <Alert severity="info">Kein Bewohner ausgewählt.</Alert>;

  return (
    <>
      <Box sx={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 2 }}>
        <DashboardCard title={`Bewohner bearbeiten: ${tenant.name} ${tenant.surname}`}>
          <Box component="form" onSubmit={handleUpdate} noValidate>
            <Typography variant="h6" gutterBottom>
              Persönliche Daten
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Vorname"
                  value={tenant.name || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="surname"
                  label="Nachname"
                  value={tenant.surname || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required sx={{ minWidth: 200 }}>
                  <InputLabel>Geschlecht</InputLabel>
                  <Select name="gender" value={tenant.gender || ""} label="Geschlecht" onChange={handleSelectChange}>
                    <MenuItem value="FEMALE">FEMALE</MenuItem>
                    <MenuItem value="MALE">MALE</MenuItem>
                    <MenuItem value="DIVERSE">DIVERSE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Geburtstag"
                  value={tenant.birthday ? dayjs(tenant.birthday) : null}
                  onChange={(d) => handleDateChange("birthday", d)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  sx={{ minWidth: 200 }}
                  options={nationalities}
                  value={tenant.nationality || ""}
                  onChange={(_, v) => handleAutocompleteChange("nationality", v)}
                  renderInput={(params) => <TextField {...params} label="Staatsangehörigkeit" required fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="tel_number"
                  label="Telefonnummer"
                  value={tenant.tel_number || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Vertragsdetails
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Einzugsdatum"
                  value={dayjs(tenant.move_in)}
                  disabled
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Zimmer" value={tenant.current_room || ""} disabled fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Auszugsdatum"
                  value={dayjs(tenant.move_out)}
                  onChange={(d) => handleDateChange("move_out", d)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="deposit"
                  label="Kaution (€)"
                  type="number"
                  value={tenant.deposit || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Probezeitende"
                  value={dayjs(tenant.probation_end)}
                  onChange={(d) => handleDateChange("probation_end", d)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Studiendetails & Notizen
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12}>
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
                    secondary={`Untermieter vom ${dayjs(sub.move_in).format("DD.MM.YYYY")} bis ${dayjs(
                      sub.move_out
                    ).format("DD.MM.YYYY")}`}
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
      </Box>

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
