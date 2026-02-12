import React, { useState, useEffect, useCallback } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Departure } from "../../../types/tenant";
import { fetchDeparturesByStatus, sendDepartureReminder } from "../../../services/departureService";
import { useNotification } from "../../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import EmailIcon from "@mui/icons-material/Email";
import { GridToolbar } from "@mui/x-data-grid/internals";

const OpenDeparturesTable: React.FC = () => {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const loadDepartures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeparturesByStatus("CREATED");
      setDepartures(data);
    } catch (err) {
      setError("Offene Anträge konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartures();
  }, [loadDepartures]);

  const handleSendReminder = async (departureId: number) => {
    try {
      await sendDepartureReminder(departureId);
      showNotification("Erinnerung gesendet.", "success");
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Senden fehlgeschlagen.", "error");
    }
  };

  const columns: GridColDef<Departure>[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Aktion",
      width: 80,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EmailIcon />}
          label="Erinnerung senden"
          onClick={() => handleSendReminder(row.tenant.id)}
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
    {
      field: "tenant.move_out",
      headerName: "Vertragsende",
      width: 120,
      type: "date",
      valueGetter: (_, row) => dayjs(row.tenant.move_out).toDate(),
    },
  ];

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={departures}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.tenant.id}
        initialState={{
          sorting: { sortModel: [{ field: "created_on", sort: "desc" }] },
        }}
        sx={{ height: "100%", cursor: "pointer" }}
        slots={{ toolbar: GridToolbar }}
        showToolbar
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        onRowClick={(params) => navigate(`/department/edit-tenant/${params.row.tenant.id}`)}
      />
    </Box>
  );
};

export default OpenDeparturesTable;
