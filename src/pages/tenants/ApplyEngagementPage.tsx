import React, { useState, useEffect } from "react";
import { Box, TextField, Button, CircularProgress, Alert, Autocomplete, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../../components/shared/DashboardCard";
import { useNotification } from "../../context/NotificationContext";
import { GlobalAppSettings, DepartmentForSelect } from "../../types/tenant";
import { fetchGlobalSettings, fetchDepartmentsForSelect, applyForEngagement } from "../../services/engagementService";
import imageCompression from "browser-image-compression";

const ApplyEngagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [settings, setSettings] = useState<GlobalAppSettings | null>(null);
  const [departments, setDepartments] = useState<DepartmentForSelect[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentForSelect | null>(null);
  const [motivation, setMotivation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const settingsData = await fetchGlobalSettings();
        setSettings(settingsData);
        if (settingsData.applications_open) {
          const deptsData = await fetchDepartmentsForSelect();
          setDepartments(deptsData);
        }
      } catch (err) {
        setError("Daten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) {
      setError("Bitte wähle ein Referat aus.");
      return;
    }
    if (!motivation.trim()) {
      setError("Bitte gib eine Motivation an.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("department", selectedDept.id.toString());
      formData.append("motivation", motivation);

      if (imageFile) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(imageFile, options);
        formData.append("image", compressedFile, compressedFile.name);
        formData.append("image_name", compressedFile.name);
      }

      await applyForEngagement(formData);
      showNotification("Bewerbung erfolgreich abgeschickt!", "success");
      navigate("/dashboard");
    } catch (err: any) {
      console.log(err);
      const errorMessage = err.response?.data?.error || "Ein Fehler ist aufgetreten.";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (!settings?.applications_open) {
    return (
      <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
        <DashboardCard title="Bewerbung">
          <Alert severity="info">Die Bewerbungsphase ist aktuell geschlossen.</Alert>
        </DashboardCard>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
      <DashboardCard title="Für ein Referat bewerben">
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 1 }}>
            <Typography variant="body1">
              Hier kannst du dich für ein Referat für das kommende Semester bewerben.
            </Typography>
            <Autocomplete
              options={departments}
              getOptionLabel={(option) => option.full_name}
              value={selectedDept}
              onChange={(_, newValue) => setSelectedDept(newValue)}
              renderInput={(params) => <TextField {...params} label="Referat" required />}
            />
            <TextField
              label="Motivation"
              multiline
              rows={8}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              required
              fullWidth
            />
            <Button variant="outlined" component="label">
              Bild hochladen (optional)
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>
            {imageFile && <Typography variant="caption">Ausgewählt: {imageFile.name}</Typography>}
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: "flex-end" }}>
              {isSubmitting ? <CircularProgress size={24} /> : "Bewerbung abschicken"}
            </Button>
          </Box>
        </form>
      </DashboardCard>
    </Box>
  );
};

export default ApplyEngagementPage;
