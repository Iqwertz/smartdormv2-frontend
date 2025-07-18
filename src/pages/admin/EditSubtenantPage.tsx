import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useParams, useNavigate } from "react-router-dom";
import DashboardCard from "../../components/shared/DashboardCard";
import { useNotification } from "../../context/NotificationContext";
import { SubtenantProfile, NewSubtenantPayload } from "../../types/tenant";
import apiClient from "../../services/api";
import dayjs, { Dayjs } from "dayjs";

interface SelectOption {
  id: number;
  label: string;
}

const EditSubtenantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<Partial<NewSubtenantPayload>>({});
  const [subtenant, setSubtenant] = useState<SubtenantProfile | null>(null);
  const [tenants, setTenants] = useState<SelectOption[]>([]);
  const [rooms, setRooms] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subtenantRes, tenantsRes, roomsRes] = await Promise.all([
          apiClient.get(`/api/department/subtenants/${id}/`),
          apiClient.get("/api/common/tenant-list/?include=tenants"),
          apiClient.get("/api/common/room-list/"),
        ]);
        setSubtenant(subtenantRes.data);
        setFormData({
          name: subtenantRes.data.name,
          surname: subtenantRes.data.surname,
          email: subtenantRes.data.email,
          move_in: subtenantRes.data.move_in,
          move_out: subtenantRes.data.move_out,
          tenant_id: subtenantRes.data.tenant,
          room_id: subtenantRes.data.room,
          university_confirmation: subtenantRes.data.university_confirmation,
        });
        setTenants(tenantsRes.data);
        setRooms(roomsRes.data);
      } catch (err) {
        setError("Daten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleDateChange = (name: keyof NewSubtenantPayload, date: Dayjs | null) => {
    setFormData((prev) => ({ ...prev, [name]: date ? date.format("YYYY-MM-DD") : null }));
  };

  const handleAutocompleteChange = (name: keyof NewSubtenantPayload, value: SelectOption | null) => {
    setFormData((prev) => ({ ...prev, [name]: value ? value.id : null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.put(`/api/department/subtenants/${id}/update/`, formData);
      showNotification("Daten erfolgreich aktualisiert.", "success");
      navigate("/department/subtenancies");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Update fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteOpen(false);
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/api/department/subtenants/${id}/delete/`);
      showNotification("Untermieter erfolgreich gelöscht.", "success");
      navigate("/department/subtenancies");
    } catch (err: any) {
      setError(err.response?.data?.error || "Löschen fehlgeschlagen.");
      showNotification("Löschen fehlgeschlagen.", "error");
      setIsSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
      <DashboardCard title={`Untermieter bearbeiten: ${subtenant?.name} ${subtenant?.surname}`}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Vorname"
                value={formData.name || ""}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="surname"
                label="Nachname"
                value={formData.surname || ""}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="E-Mail"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Einzugsdatum"
                value={formData.move_in ? dayjs(formData.move_in) : null}
                onChange={(d) => handleDateChange("move_in", d)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Auszugsdatum"
                value={formData.move_out ? dayjs(formData.move_out) : null}
                onChange={(d) => handleDateChange("move_out", d)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                sx={{ minWidth: 500 }}
                options={tenants}
                value={tenants.find((t) => t.id === formData.tenant_id) || null}
                getOptionLabel={(o) => o.label}
                onChange={(_, v) => handleAutocompleteChange("tenant_id", v)}
                renderInput={(params) => <TextField {...params} label="Hauptmieter" required fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                sx={{ minWidth: 130 }}
                options={rooms}
                value={rooms.find((r) => r.id === formData.room_id) || null}
                getOptionLabel={(o) => o.label}
                onChange={(_, v) => handleAutocompleteChange("room_id", v)}
                renderInput={(params) => <TextField {...params} label="Zimmer" required fullWidth />}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="university_confirmation"
                    checked={formData.university_confirmation || false}
                    onChange={handleChange}
                  />
                }
                label="Bestätigung der Partneruniversität liegt vor"
              />
            </Grid>
          </Grid>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button color="error" variant="outlined" onClick={() => setDeleteOpen(true)} disabled={isSubmitting}>
              Löschen
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : "Änderungen speichern"}
            </Button>
          </Box>
        </form>
      </DashboardCard>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Löschen bestätigen</DialogTitle>
        <DialogContent>
          <DialogContentText>Möchten Sie den Untermieter wirklich löschen?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDelete} color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditSubtenantPage;
