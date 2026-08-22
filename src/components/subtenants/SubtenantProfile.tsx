// src/components/subtenants/SubtenantProfile.tsx
/**
 * The subtenant's own sublet data. Mirrors the read-only layout of the tenants'
 * UserProfile card, but reads from the subtenant endpoint - subtenants have no record
 * in the tenant table.
 */
import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, TextField, Typography } from "@mui/material";
import { fetchMySubtenantProfile } from "../../services/subtenantService";
import { SubtenantOwnProfile } from "../../types/tenant";

const fieldWidths = {
  name: "130px",
  surname: "130px",
  email: "170px",
  room: "90px",
  tenant: "170px",
  date: "120px",
  duration: "120px",
  confirmation: "220px",
};

const fieldSx = (minWidth: string) => ({
  minWidth,
  flex: "1 1 auto",
  maxWidth: "100%",
  "& .MuiInputLabel-root": { fontSize: "0.9rem" },
  "& .MuiInputBase-input": { fontSize: "0.9rem" },
});

const formatDate = (value: string | null): string => (value ? new Date(value).toLocaleDateString("de-DE") : "");

const formatDuration = (months: number | null): string => {
  if (months === null || months === undefined) return "N/A";
  return `${months.toLocaleString("de-DE")} Monate`;
};

const SubtenantProfile: React.FC = () => {
  const [profile, setProfile] = useState<SubtenantOwnProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMySubtenantProfile()
      .then((data) => {
        setProfile(data);
        setError(null);
      })
      .catch((err) => {
        // The LDAP account outlives the sublet, so a 404 here is a normal state.
        if (err.response?.status === 404) {
          setError("Zu deinem Konto ist aktuell keine laufende Untermiete hinterlegt.");
        } else {
          setError("Deine Daten konnten nicht geladen werden.");
        }
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="info">{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box p={2}>
        <Typography>Keine Daten verfügbar.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "18px" }}>
      <TextField label="Vorname" value={profile.name || ""} disabled variant="standard" size="small" sx={fieldSx(fieldWidths.name)} />
      <TextField
        label="Nachname"
        value={profile.surname || ""}
        disabled
        variant="standard"
        size="small"
        sx={fieldSx(fieldWidths.surname)}
      />
      <TextField
        label="E-Mail"
        value={profile.email || ""}
        disabled
        variant="standard"
        size="small"
        sx={fieldSx(fieldWidths.email)}
      />
      <TextField
        label="Zimmer"
        value={profile.room_name || "N/A"}
        disabled
        variant="standard"
        size="small"
        sx={fieldSx(fieldWidths.room)}
      />
      <TextField
        label="Hauptmieter"
        value={profile.tenant_name || "N/A"}
        disabled
        variant="standard"
        size="small"
        sx={fieldSx(fieldWidths.tenant)}
      />
      <TextField
        label="Einzugsdatum"
        value={formatDate(profile.move_in)}
        disabled
        variant="standard"
        size="small"
        sx={fieldSx(fieldWidths.date)}
      />
      <TextField
        label="Auszugsdatum"
        value={formatDate(profile.move_out)}
        disabled
        variant="standard"
        size="small"
        sx={fieldSx(fieldWidths.date)}
      />
      <TextField
        label="Untermietdauer"
        value={formatDuration(profile.duration_months)}
        disabled
        variant="standard"
        size="small"
        sx={fieldSx(fieldWidths.duration)}
      />
      <TextField
        label="Bestätigung Partneruniversität"
        value={profile.university_confirmation ? "Liegt vor" : "Liegt nicht vor"}
        disabled
        variant="standard"
        size="small"
        sx={fieldSx(fieldWidths.confirmation)}
      />
    </Box>
  );
};

export default SubtenantProfile;
