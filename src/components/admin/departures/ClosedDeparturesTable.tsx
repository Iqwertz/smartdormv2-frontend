import React, { useState, useEffect, useCallback } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Departure } from "../../../types/tenant";
import { fetchDeparturesByStatus } from "../../../services/departureService";
import dayjs from "dayjs";

const ClosedDeparturesTable: React.FC = () => {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDepartures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeparturesByStatus("CLOSED");
      setDepartures(data);
    } catch (err) {
      setError("Abgeschlossene Anträge konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartures();
  }, [loadDepartures]);

  const columns: GridColDef<Departure>[] = [
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
      headerName: "Auszugsdatum",
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
          sorting: { sortModel: [{ field: "tenant.move_out", sort: "desc" }] },
        }}
        autoHeight
      />
    </Box>
  );
};

export default ClosedDeparturesTable;
