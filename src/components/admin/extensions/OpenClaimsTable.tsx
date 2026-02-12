import React, { useState, useEffect, useCallback } from "react";
import { Box, Alert, CircularProgress, Tooltip } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Claim } from "../../../types/tenant";
import { fetchClaimsByStatus, sendClaimReminder, updateClaimStatus } from "../../../services/claimService";
import { useNotification } from "../../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { GridToolbar } from "@mui/x-data-grid/internals";

const OpenClaimsTable: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

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

  const handleRowClick = (params: any) => {
    // Check if text is selected - if so, don't navigate
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    navigate(`/department/edit-tenant/${params.row.tenant.id}`);
  };

  const columns: GridColDef<Claim>[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Aktionen",
      width: 100,
      getActions: ({ row }) => [
        <Tooltip title="Erinnerung senden" key="email-tooltip">
          <GridActionsCellItem
            icon={<EmailIcon />}
            label="Erinnerung senden"
            onClick={() => handleSendReminder(row.id)}
          />
        </Tooltip>,
        <Tooltip title="Bewerbung eingereicht" key="check-tooltip">
          <GridActionsCellItem
            icon={<CheckCircleOutlineIcon />}
            label="Bewerbung eingereicht"
            onClick={() => handleMarkAsProcessing(row.id)}
          />
        </Tooltip>,
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
    {
      field: "move_out",
      headerName: "Auszugsdatum",
      width: 160,
      type: "date",
      valueGetter: (value) => dayjs(value).toDate(),
    },
  ];

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={claims}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        sx={{ 
          height: "100%",
          "& .MuiDataGrid-row": {
            cursor: "pointer",
          },
        }}
        slots={{ toolbar: GridToolbar }}
        showToolbar
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        initialState={{
          sorting: {
            sortModel: [{ field: "move_out", sort: "asc" }],
          },
        }}
        onRowClick={handleRowClick}
      />
    </Box>
  );
};

export default OpenClaimsTable;
