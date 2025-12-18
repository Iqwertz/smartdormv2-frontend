import React, { useState, useEffect, useCallback } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { fetchTenantBillingOverview, TenantBillingOverview } from "../../../services/printingService";
import { GridToolbar } from "@mui/x-data-grid/internals";

const TenantBillingTab: React.FC = () => {
  const [billingData, setBillingData] = useState<TenantBillingOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBillingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTenantBillingOverview();
      setBillingData(data);
    } catch (err) {
      setError("Abrechnungsdaten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const columns: GridColDef<TenantBillingOverview>[] = [
    { field: "surname", headerName: "Nachname", width: 150 },
    { field: "name", headerName: "Vorname", width: 150 },
    { field: "current_room", headerName: "Zimmer", width: 100 },
    { field: "email", headerName: "E-Mail", width: 220 },
    {
      field: "total_cost",
      headerName: "Gesamtkosten (€)",
      width: 140,
      type: "number",
      valueGetter: (value) => parseFloat(value),
      valueFormatter: (value) => `${parseFloat(value as string).toFixed(2)} €`,
    },
    {
      field: "total_pages",
      headerName: "Seiten",
      width: 100,
      type: "number",
    },
    {
      field: "total_jobs",
      headerName: "Aufträge",
      width: 100,
      type: "number",
    },
    {
      field: "total_sessions",
      headerName: "Sessions",
      width: 100,
      type: "number",
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Calculate total sum
  const totalSum = billingData.reduce((sum, tenant) => sum + parseFloat(tenant.total_cost), 0);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box mb={2}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Gesamtkosten aller Nutzer: <strong>{totalSum.toFixed(2)} €</strong>
        </Alert>
      </Box>
      <DataGrid
        rows={billingData}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.tenant_id}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: "total_cost", sort: "desc" }] },
        }}
        slots={{
          toolbar: GridToolbar,
        }}
        sx={{
          "& .MuiDataGrid-row:hover": {
            cursor: "pointer",
          },
        }}
      />
    </Box>
  );
};

export default TenantBillingTab;

