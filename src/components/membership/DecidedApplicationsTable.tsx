import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Link as MuiLink } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { MembershipApplication } from "../../types/membership";
import { applicationPdfUrl, fetchApplications } from "../../services/membershipService";

interface DecidedApplicationsTableProps {
  status: "APPROVED" | "REJECTED";
}

/** Read-only history of decided Beitrittsanträge. */
const DecidedApplicationsTable: React.FC<DecidedApplicationsTableProps> = ({ status }) => {
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApplications(await fetchApplications(status));
    } catch {
      setError("Die Anträge konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: GridColDef<MembershipApplication>[] = [
    { field: "last_name", headerName: "Nachname", width: 150 },
    { field: "first_name", headerName: "Vorname", width: 150 },
    {
      field: "room",
      headerName: "Zimmer",
      width: 100,
      valueGetter: (_, row) => row.tenant.current_room,
    },
    {
      field: "submitted_at",
      headerName: "Eingereicht",
      width: 130,
      type: "date",
      valueGetter: (value) => dayjs(value).toDate(),
    },
    {
      field: "decided_at",
      headerName: "Entschieden",
      width: 130,
      type: "date",
      valueGetter: (value) => (value ? dayjs(value).toDate() : null),
    },
    { field: "decided_by", headerName: "Entschieden von", width: 160 },
    { field: "payment_method_display", headerName: "Zahlungsart", width: 200 },
    { field: "decision_note", headerName: "Notiz", width: 220, sortable: false },
    {
      field: "has_pdf",
      headerName: "Erklärung",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.has_pdf ? (
          <MuiLink href={applicationPdfUrl(params.row.id)} target="_blank" rel="noopener">
            PDF
          </MuiLink>
        ) : (
          "-"
        ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: "100%", minHeight: 400 }}>
      <DataGrid
        rows={applications}
        columns={columns}
        getRowId={(row) => row.id}
        slots={{ toolbar: GridToolbar }}
        showToolbar
        initialState={{ sorting: { sortModel: [{ field: "decided_at", sort: "desc" }] } }}
        pageSizeOptions={[25, 50, 100]}
        density="compact"
      />
    </Box>
  );
};

export default DecidedApplicationsTable;
