import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DashboardCard from "../../components/shared/DashboardCard";
import { useNotification } from "../../context/NotificationContext";
import { NewTenantPayload } from "../../types/tenant";
import apiClient from "../../services/api";
import dayjs, { Dayjs } from "dayjs";
import { nationalities } from "../../utils/nationalities";
import { universities } from "../../utils/universities";

interface SelectOption {
  id: number;
  label: string;
}

const createNewTenant = async (data: NewTenantPayload) => {
  const payload = {
    ...data,
    deposit: parseFloat(data.deposit as string),
  };
  const response = await apiClient.post("/api/department/create-new-tenant/", payload);
  return response.data;
};

const initialState: NewTenantPayload = {
  name: "",
  surname: "",
  email: "",
  gender: "",
  nationality: "",
  birthday: null,
  tel_number: "",
  move_in: null,
  current_room: "",
  deposit: "",
  university: "",
  study_field: "",
  note: "",
};

const NewTenantPage: React.FC = () => {
  const [formData, setFormData] = useState<NewTenantPayload>(initialState);
  const [rooms, setRooms] = useState<SelectOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    apiClient.get("/api/common/room-list/").then((res) => setRooms(res.data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name: keyof NewTenantPayload, date: Dayjs | null) => {
    setFormData({ ...formData, [name]: date ? date.format("YYYY-MM-DD") : null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.name || !formData.surname || !formData.email || !formData.move_in) {
      setError("Bitte füllen Sie alle erforderlichen Felder aus.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await createNewTenant(formData);
      showNotification(`Bewohner ${response.username} erfolgreich erstellt.`, "success");
      setFormData(initialState);
    } catch (err: any) {
      const serverErrors = err.response?.data;
      let errorMessage = "Ein unbekannter Fehler ist aufgetreten.";
      if (typeof serverErrors === "object" && serverErrors !== null) {
        // Concatenate all error messages from the server
        errorMessage = Object.entries(serverErrors)
          .map(([key, value]) => `${key}: ${(value as string[]).join(", ")}`)
          .join("; ");
      } else if (serverErrors?.error) {
        errorMessage = serverErrors.error;
      }
      setError(errorMessage);
      showNotification(errorMessage, "error", 10000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
      <DashboardCard title="Neuen Bewohner anlegen">
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Typography variant="h6" gutterBottom>
            Persönliche Daten
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField name="name" label="Vorname" value={formData.name} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="surname"
                label="Nachname"
                value={formData.surname}
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
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required sx={{ minWidth: 200 }}>
                <InputLabel id="gender-label">Geschlecht</InputLabel>
                <Select
                  labelId="gender-label"
                  name="gender"
                  value={formData.gender}
                  label="Geschlecht"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="FEMALE">FEMALE</MenuItem>
                  <MenuItem value="MALE">MALE</MenuItem>
                  <MenuItem value="DIVERSE">DIVERSE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Geburtstag"
                value={formData.birthday ? dayjs(formData.birthday) : null}
                onChange={(date) => handleDateChange("birthday", date)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                sx={{ minWidth: 220 }}
                options={nationalities}
                value={formData.nationality}
                onChange={(_, newValue) => setFormData({ ...formData, nationality: newValue || "" })}
                renderInput={(params) => <TextField {...params} label="Staatsangehörigkeit" required fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="tel_number"
                label="Telefonnummer"
                value={formData.tel_number}
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <DatePicker
                label="Einzugsdatum"
                value={formData.move_in ? dayjs(formData.move_in) : null}
                onChange={(date) => handleDateChange("move_in", date)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete
                options={rooms}
                getOptionLabel={(option) => option.label}
                value={rooms.find((r) => r.label === formData.current_room) || null}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, current_room: newValue ? newValue.label : "" });
                }}
                renderInput={(params) => <TextField {...params} label="Zimmer" required fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="deposit"
                label="Kaution (€)"
                type="number"
                value={formData.deposit}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{ inputProps: { step: "0.01" } }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Studiendetails
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required sx={{ minWidth: 300 }}>
                <InputLabel id="university-label">Hochschule</InputLabel>
                <Select
                  labelId="university-label"
                  name="university"
                  value={formData.university}
                  label="Hochschule"
                  onChange={handleSelectChange}
                >
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>
                      {uni}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="study_field"
                label="Studienfach"
                value={formData.study_field}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2} sx={{ width: "100%" }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="note"
                label="Notiz der Verwaltung"
                multiline
                rows={4}
                value={formData.note}
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
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : "Bewohner hinzufügen"}
            </Button>
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
};

export default NewTenantPage;
