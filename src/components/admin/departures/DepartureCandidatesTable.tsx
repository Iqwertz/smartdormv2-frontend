import React, { useState, useEffect, useCallback } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { TenantProfile } from "../../../types/tenant";
import { fetchDepartureCandidates, createDeparture } from "../../../services/departureService";
import { useNotification } from "../../../context/NotificationContext";
import PostAddIcon from "@mui/icons-material/PostAdd";
import dayjs from "dayjs";

const DepartureCandidatesTable: React.FC = () => {
  const [candidates, setCandidates] = useState<TenantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

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
      showNotification("Auszug erfolgreich erstellt.", "success");
      loadCandidates(); // Refresh the list
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Fehler beim Erstellen des Auszugs.", "error");
    }
  };

  const columns: GridColDef<TenantProfile>[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Aktion",
      width: 80,
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<PostAddIcon />}
          label="Auszug erstellen"
          onClick={() => handleCreateDeparture(id as number)}
          showInMenu={false}
        />,
      ],
    },
    { field: "surname", headerName: "Nachname", width: 150 },
    { field: "name", headerName: "Vorname", width: 150 },
    { field: "email", headerName: "E-Mail", width: 220 },
    { field: "current_room", headerName: "Zimmer", width: 100 },
    {
      field: "move_out",
      headerName: "Auszugsdatum",
      width: 150,
      type: "date",
      valueGetter: (value) => (value ? dayjs(value).toDate() : null),
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
        autoHeight
        initialState={{
          sorting: { sortModel: [{ field: "move_out", sort: "asc" }] },
        }}
      />
    </Box>
  );
};

export default DepartureCandidatesTable;
