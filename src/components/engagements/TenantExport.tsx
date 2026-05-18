// TenantExport.tsx
import React, { useState } from "react";
import { Box, Button, Typography, Autocomplete, TextField, CircularProgress } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useNotification } from "../../context/NotificationContext"; // Adjust path as needed
import apiClient from "../../services/api"; // Adjust path as needed
import { ALL_FLOORS } from "../../config"; // Adjust path as needed
import dayjs from "dayjs";

const TenantExport: React.FC = () => {
  const { showNotification } = useNotification();
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const floorOptions = ["Alle Stockwerke", ...ALL_FLOORS];

  const handleDownload = async () => {
    if (!selectedFloor) {
      showNotification("Bitte wählen Sie eine Option aus.", "warning");
      return;
    }
    setIsDownloading(true);
    try {
      const params = selectedFloor && selectedFloor !== "Alle Stockwerke" ? { floor: selectedFloor } : {};

      const response = await apiClient.get("/api/engagements/export_tenants-csv/", {
        params,
        responseType: "blob", // Important for file downloads
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Create a link to trigger the download
      const link = document.createElement("a");
      link.href = url;

      const floorName = selectedFloor && selectedFloor !== "Alle Stockwerke" ? selectedFloor : "all";
      const timestamp = dayjs().format("YYYY-MM-DD");
      link.setAttribute("download", `bewohnerliste_${floorName}_${timestamp}.csv`);

      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification("Download erfolgreich gestartet.", "success");
    } catch (error) {
      console.error("Failed to download tenant list:", error);
      showNotification("Download fehlgeschlagen. Bitte versuchen Sie es erneut.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3, maxWidth: "500px", margin: "0 auto" }}>
      <Typography variant="h6">Bewohnerliste herunterladen</Typography>
      <Autocomplete
        options={floorOptions}
        value={selectedFloor}
        onChange={(_, newValue) => {
          setSelectedFloor(newValue);
        }}
        renderInput={(params) => <TextField {...params} label="Stockwerk auswählen" />}
      />
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
        disabled={isDownloading || !selectedFloor}
        sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
      >
        {isDownloading ? <CircularProgress size={24} color="inherit" /> : "CSV Herunterladen"}
      </Button>
    </Box>
  );
};

export default TenantExport;
