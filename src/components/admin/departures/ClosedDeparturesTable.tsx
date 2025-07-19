import React, { useState, useEffect, useCallback } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Departure } from "../../../types/tenant";
import { fetchDepartures } from "../../../services/departureService";
import dayjs from "dayjs";

const ClosedDeparturesTable: React.FC = () => {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDepartures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDepartures("CLOSED");
      setDepartures(data);
    } catch (err) {
      setError("Abgeschlossene Auszüge konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartures();
  }, [loadDepartures]);

  const columns: GridColDef<Departure>[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      valueGetter: (value, row) => `${row.tenant.name} ${row.tenant.surname}`,
    },
    {
      field: "move_out",
      headerName: "Auszugsdatum",
      width: 150,
      type: "date",
      valueGetter: (value, row) => dayjs(row.tenant.move_out).toDate(),
    },
    {
      field: "created_on",
      headerName: "Prozess gestartet am",
      width: 180,
      type: "date",
      valueGetter: (value, row) => dayjs(row.created_on).toDate(),
    },
    {
      field: "total_debt",
      headerName: "Schulden (€)",
      width: 150,
      type: "number",
      valueGetter: (value, row) => row.signatures.reduce((acc, sig) => acc + parseFloat(String(sig.amount)), 0),
    },
  ];

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: "100%", width: "100%", overflow: "auto" }}>
      <DataGrid
        rows={departures}
        columns={columns}
        getRowId={(row) => row.tenant.id}
        loading={loading}
        autoHeight
        initialState={{
          sorting: { sortModel: [{ field: "move_out", sort: "desc" }] },
        }}
      />
    </Box>
  );
};

export default ClosedDeparturesTable;
