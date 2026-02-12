import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { TenantProfile } from "../../../types/tenant";
import { fetchDepartureCandidates, createDeparture } from "../../../services/departureService";
import { useNotification } from "../../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { GridToolbar } from "@mui/x-data-grid/internals";

const DepartureCandidatesTable: React.FC = () => {
  const [candidates, setCandidates] = useState<TenantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDepartureCandidates();
      setCandidates(data);
    } catch (err) {
      setError("Auszugskandidaten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleCreateDeparture = async (tenantId: number) => {
    try {
      await createDeparture(tenantId);
      showNotification("Auszugsantrag erfolgreich erstellt.", "success");
      loadCandidates(); // Refresh the list
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Erstellen des Antrags fehlgeschlagen.", "error");
    }
  };

  const handleRowMouseDown = (event: React.MouseEvent) => {
    mouseDownPos.current = { x: event.clientX, y: event.clientY };
  };

  const handleRowClick = (params: any, event: React.MouseEvent) => {
    // Check if text was selected (dragging)
    if (mouseDownPos.current) {
      const dx = Math.abs(event.clientX - mouseDownPos.current.x);
      const dy = Math.abs(event.clientY - mouseDownPos.current.y);
      // If mouse moved more than 5px, consider it a drag/selection
      if (dx > 5 || dy > 5) {
        return;
      }
    }
    
    // Don't navigate if clicking on actions column
    if ((event.target as HTMLElement).closest('[data-field="actions"]')) {
      return;
    }

    navigate(`/department/edit-tenant/${params.id}`);
  };

  const columns: GridColDef<TenantProfile>[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Aktion",
      width: 80,
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<AddCircleOutlineIcon />}
          label="Auszugsantrag erstellen"
          onClick={() => handleCreateDeparture(id as number)}
          showInMenu
        />,
      ],
    },
    { field: "surname", headerName: "Nachname", width: 150 },
    { field: "name", headerName: "Vorname", width: 150 },
    { field: "current_room", headerName: "Zimmer", width: 100 },
    { field: "email", headerName: "E-Mail", width: 220 },
    {
      field: "move_out",
      headerName: "Vertragsende",
      width: 120,
      type: "date",
      valueGetter: (value) => dayjs(value).toDate(),
    },
  ];

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={candidates}
        columns={columns}
        loading={loading}
        initialState={{
          sorting: { sortModel: [{ field: "move_out", sort: "asc" }] },
        }}
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
          row: {
            onMouseDown: handleRowMouseDown,
          },
        }}
        onRowClick={handleRowClick}
      />
    </Box>
  );
};

export default DepartureCandidatesTable;
