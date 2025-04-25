// src/components/dashboard/content/UserProfile.tsx
import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, CircularProgress, Alert } from "@mui/material";
import apiClient from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import { TenantProfile } from "../../../../types/tenant";

// Define approximate widths based on expected content length
const fieldWidths = {
  name: "130px",
  surname: "130px",
  email: "170px",
  birthday: "100px",
  gender: "100px",
  nationality: "120px",
  tel_number: "140px",
  extension: "100px",
  university: "80px",
  study_field: "80px",
  move_in: "100px",
  move_out: "100px",
  current_room: "70px",
  current_floor: "50px",
  current_points: "80px",
  deposit: "80px",
  sublet: "80px",
};

const UserProfile: React.FC = () => {
  const { authState } = useAuth();
  const [tenantData, setTenantData] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      console.log(authState.user);
      setLoading(true);
      apiClient
        .get("/api/tenants/profile-data")
        .then((response) => {
          setTenantData(response.data);
          setError(null);
        })
        .catch((err) => {
          setError("Failed to load tenant profile.");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [authState]);

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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!tenantData) {
    return (
      <Box p={2}>
        <Typography>No profile data available.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: "18px",
      }}
    >
      <TextField
        label="Vorname"
        value={tenantData.name || ""}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.name,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Nachname"
        value={tenantData.surname || ""}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.surname,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="E-Mail"
        value={tenantData.email || ""}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.email,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Geburtsdatum"
        type="date"
        value={tenantData.birthday || ""}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.birthday,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Geschlecht"
        value={tenantData.gender || ""}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.gender,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Nationalität"
        value={tenantData.nationality || ""}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.nationality,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Telefon"
        value={tenantData.tel_number || "N/A"}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.tel_number,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Universität"
        value={tenantData.university || ""}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.university,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Studienfach"
        value={tenantData.study_field || ""}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.study_field,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Zimmer"
        type="number"
        value={tenantData.current_room || "N/A"}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.current_room,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Flur"
        value={tenantData.current_floor || "N/A"}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.current_floor,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Einzug"
        type="date"
        value={tenantData.move_in || ""}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.move_in,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Auszug"
        type="date"
        value={tenantData.move_out || ""}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.move_out,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Kaution"
        value={tenantData.deposit ? `€${tenantData.deposit}` : "N/A"}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.deposit,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Punkte"
        type="number"
        value={tenantData.current_points ?? "N/A"}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.current_points,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Verlängerungen"
        type="number"
        value={tenantData.extension ?? "N/A"}
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.extension,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
      <TextField
        label="Untermiete (max. 12 Monate)"
        value={tenantData.sublet ?? "N/A"}
        type="number"
        disabled
        variant="standard"
        size="small"
        sx={{
          width: fieldWidths.sublet,
          "& .MuiInputLabel-root": { fontSize: "0.9rem" },
          "& .MuiInputBase-input": { fontSize: "0.9rem" },
        }}
      />
    </Box>
  );
};

export default UserProfile;
