import React, { useState, useEffect, useCallback } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Claim } from "../../../types/tenant";
import { fetchClaimsByStatus, sendClaimReminder, updateClaimStatus } from "../../../services/claimService";
import { useNotification } from "../../../context/NotificationContext";
import dayjs from "dayjs";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const OpenClaimsTable: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClaimsByStatus("CREATED");
      setClaims(data);
    } catch (err) {
      setError("Offene Anträge konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleSendReminder = async (claimId: number) => {
    try {
      await sendClaimReminder(claimId);
      showNotification("Erinnerung gesendet.", "success");
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Senden fehlgeschlagen.", "error");
    }
  };

  const handleMarkAsProcessing = async (claimId: number) => {
    try {
      await updateClaimStatus(claimId, "PROCESSING");
      showNotification("Status auf 'In Bearbeitung' gesetzt.", "success");
      loadClaims(); // Refresh list
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Status-Update fehlgeschlagen.", "error");
    }
  };

  const columns: GridColDef<Claim>[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Aktionen",
      width: 150,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EmailIcon />}
          label="Erinnerung senden"
          onClick={() => handleSendReminder(row.id)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<CheckCircleOutlineIcon />}
          label="Bewertung eingereicht"
          onClick={() => handleMarkAsProcessing(row.id)}
          showInMenu
        />,
      ],
    },
    { field: "tenant.surname", headerName: "Nachname", width: 150, valueGetter: (_, row) => row.tenant.surname },
    { field: "tenant.name", headerName: "Vorname", width: 150, valueGetter: (_, row) => row.tenant.name },
    {
      field: "tenant.current_room",
      headerName: "Zimmer",
      width: 100,
      valueGetter: (_, row) => row.tenant.current_room,
    },
    {
      field: "created_on",
      headerName: "Antrag vom",
      width: 120,
      type: "date",
      valueGetter: (value) => dayjs(value).toDate(),
    },
  ];

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid rows={claims} columns={columns} loading={loading} getRowId={(row) => row.id} autoHeight />
    </Box>
  );
};

export default OpenClaimsTable;
