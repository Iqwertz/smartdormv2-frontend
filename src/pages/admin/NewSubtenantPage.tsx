import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  Autocomplete,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../../components/tenants/dashboard/DashboardCard";
import { useNotification } from "../../context/NotificationContext";
import { NewSubtenantPayload } from "../../types/tenant";
import apiClient from "../../services/api";
import dayjs, { Dayjs } from "dayjs";

interface SelectOption {
  id: number;
  label: string;
}

const NewSubtenantPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<NewSubtenantPayload>({
    name: "",
    surname: "",
    email: "",
    move_in: null,
    move_out: null,
    tenant_id: null,
    room_id: null,
    university_confirmation: false,
  });
  const [tenants, setTenants] = useState<SelectOption[]>([]);
  const [rooms, setRooms] = useState<SelectOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get("/api/common/tenant-list/?include=tenants").then((res) => setTenants(res.data));
    apiClient.get("/api/common/room-list/").then((res) => setRooms(res.data));
  }, []);

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
      await apiClient.post("/api/department/subtenants/create/", formData);
      showNotification("Untermieter erfolgreich erstellt.", "success");
      navigate("/department/subtenancies");
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || "Erstellen fehlgeschlagen.";
      setError(errorMessage);
      showNotification(errorMessage, "error", 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
      <DashboardCard title="Neuen Untermieter anlegen">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="name" label="Vorname" onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="surname" label="Nachname" onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField name="email" label="E-Mail" type="email" onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Einzugsdatum"
                onChange={(d) => handleDateChange("move_in", d)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Auszugsdatum"
                onChange={(d) => handleDateChange("move_out", d)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                sx={{ minWidth: 500 }}
                options={tenants}
                getOptionLabel={(o) => o.label}
                onChange={(_, v) => handleAutocompleteChange("tenant_id", v)}
                renderInput={(params) => <TextField {...params} label="Hauptmieter" required fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                sx={{ minWidth: 130 }}
                options={rooms}
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
                    checked={formData.university_confirmation}
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
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : "Untermieter anlegen"}
            </Button>
          </Box>
        </form>
      </DashboardCard>
    </Box>
  );
};

export default NewSubtenantPage;
