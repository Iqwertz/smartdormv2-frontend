import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Alert, CircularProgress, Chip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Claim } from "../../../types/tenant";
import { fetchClaimsByStatus } from "../../../services/claimService";
import dayjs from "dayjs";
import { GridToolbar } from "@mui/x-data-grid/internals";
import { useNavigate } from "react-router-dom";

const CompletedClaimsTable: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClaimsByStatus("COMPLETED");
      setClaims(data);
    } catch (err) {
      setError("Abgeschlossene Anträge konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const columns: GridColDef<Claim>[] = [
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "APPROVED" ? "success" : "error"}
          size="small"
          variant="outlined"
        />
      ),
    },
    { field: "tenant.surname", headerName: "Nachname", width: 150, valueGetter: (_, row) => row.tenant.surname },
    { field: "tenant.name", headerName: "Vorname", width: 150, valueGetter: (_, row) => row.tenant.name },
    {
      field: "created_on",
      headerName: "Antrag vom",
      width: 120,
      type: "date",
      valueGetter: (value) => dayjs(value).toDate(),
    },
  ];

  const handleMouseDown = (event: React.MouseEvent) => {
    mouseDownPos.current = { x: event.clientX, y: event.clientY };
  };

  const handleRowClick = (params: { row: Claim }, event: React.MouseEvent) => {
    if (mouseDownPos.current) {
      const dx = Math.abs(event.clientX - mouseDownPos.current.x);
      const dy = Math.abs(event.clientY - mouseDownPos.current.y);
      // If mouse moved more than 5 pixels, consider it a text selection
      if (dx > 5 || dy > 5) {
        return;
      }
    }
    navigate(`/department/edit-tenant/${params.row.tenant.id}`);
  };

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
          row: {
            onMouseDown: handleMouseDown,
          },
        }}
        onRowClick={handleRowClick}
      />
    </Box>
  );
};

export default CompletedClaimsTable;
