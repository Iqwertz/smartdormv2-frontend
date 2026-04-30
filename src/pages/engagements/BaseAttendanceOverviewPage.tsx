import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";
import attendanceService, { TenantAttendanceSummary } from "../../services/attendanceService";
import DashboardCard from "../../components/shared/DashboardCard";
import { GridToolbar } from "@mui/x-data-grid/internals";

const BaseAttendanceOverviewPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [tenants, setTenants] = useState<TenantAttendanceSummary[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantAttendanceSummary | null>(null);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState<{
    scanned_sessions: Array<{
      session_id: number;
      session_title: string;
      session_date: string;
      parts_attended: number[];
      has_manual_override: boolean;
      latest_timestamp: string;
    }>;
    base_attendance: {
      parts_count: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [baseAttendanceInputs, setBaseAttendanceInputs] = useState<Record<number, string>>({});
  const [processingTenantId, setProcessingTenantId] = useState<number | null>(null);
  const loadedEventRef = useRef<string | null>(null);
  const loadingInFlightRef = useRef(false);

  const fetchOverview = useCallback(
    (force = false) => {
      if (!eventId) return;
      if (!force && loadedEventRef.current === eventId) return;
      if (!force && loadingInFlightRef.current) return;

      loadingInFlightRef.current = true;
      setLoading(true);
      attendanceService
        .getBaseAttendanceOverview(parseInt(eventId, 10))
        .then((res) => {
          setTenants(res.data);
          const initialInputs: Record<number, string> = {};
          res.data.forEach((tenant) => {
            initialInputs[tenant.tenant_id] = String(tenant.base_attendance_count ?? 0);
          });
          setBaseAttendanceInputs(initialInputs);
          loadedEventRef.current = eventId;
        })
        .catch(console.error)
        .finally(() => {
          loadingInFlightRef.current = false;
          setLoading(false);
        });
    },
    [eventId],
  );

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleRowClick = (tenant: TenantAttendanceSummary) => {
    if (!eventId) return;
    setSelectedTenant(tenant);
    setDialogOpen(true);
    setDetailLoading(true);
    attendanceService
      .getTenantAttendanceDetail(parseInt(eventId, 10), tenant.tenant_id)
      .then((res) => setSelectedTenantDetails(res.data))
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  };

  const handleInputChange = (tenantId: number, value: string) => {
    setBaseAttendanceInputs((prev) => ({ ...prev, [tenantId]: value }));
  };

  const handleSaveBaseAttendance = (tenantId: number) => {
    if (!eventId) return;
    const value = baseAttendanceInputs[tenantId] ?? "0";
    const parsed = Number.parseInt(value, 10);
    const partsCount = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;

    setProcessingTenantId(tenantId);
    attendanceService
      .addOrUpdateBaseAttendance(parseInt(eventId, 10), tenantId, partsCount)
      .then(() => fetchOverview(true))
      .catch((err) => {
        console.error(err);
        window.alert("Basis-Anwesenheit konnte nicht gespeichert werden.");
      })
      .finally(() => setProcessingTenantId(null));
  };

  const columns = useMemo<GridColDef[]>(() => {
    return [
      {
        field: "surname",
        headerName: "Nachname",
        width: 150,
      },
      {
        field: "name",
        headerName: "Vorname",
        width: 150,
      },
      {
        field: "current_room",
        headerName: "Zimmer",
        width: 110,
        valueGetter: (value, row) => row.current_room ?? "-",
      },
      {
        field: "current_floor",
        headerName: "Flur",
        width: 100,
        valueGetter: (value, row) => row.current_floor ?? "-",
      },
      {
        field: "attended_sessions_count",
        headerName: "Erfüllte Sessions",
        width: 160,
        type: "number",
      },
      {
        field: "base_attendance_count",
        headerName: "Basis-Anwesenheit",
        width: 170,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const row = params.row as TenantAttendanceSummary;
          const value = baseAttendanceInputs[row.tenant_id] ?? "0";
          const isProcessing = processingTenantId === row.tenant_id;
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                width: "100%",
                height: "100%",
              }}
            >
              <TextField
                type="number"
                value={value}
                onChange={(event) => handleInputChange(row.tenant_id, event.target.value)}
                onClick={(event) => event.stopPropagation()}
                inputProps={{ min: 0 }}
                disabled={isProcessing}
                variant="outlined"
                size="small"
                sx={{
                  width: 64,
                  "& .MuiInputBase-root": { height: 28 },
                  "& .MuiInputBase-input": { py: 0.25, px: 1, fontSize: "0.8rem" },
                }}
              />
              <Tooltip title="Speichern">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSaveBaseAttendance(row.tenant_id);
                  }}
                  disabled={isProcessing}
                  sx={{ p: 0.5 }}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
      {
        field: "total_attendance_count",
        headerName: "Gesamt",
        width: 100,
        type: "number",
      },
    ];
  }, [baseAttendanceInputs, processingTenantId]);

  if (!eventId) {
    return <div>Event ID not found</div>;
  }

  return (
    <Box
      sx={{
        maxWidth: "1600px",
        margin: "0 auto",
        height: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
      }}
      className="page-root"
    >
      <DashboardCard
        title="Basis-Anwesenheit Übersicht"
        cardSx={{ height: "100%", display: "flex", flexDirection: "column" }}
        contentSx={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: 2, height: "100%" }}
      >
        {loading ? (
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, height: "100%", minHeight: 0 }}>
            <DataGrid
              rows={tenants}
              columns={columns}
              getRowId={(row) => row.tenant_id}
              onRowClick={(params) => handleRowClick(params.row as TenantAttendanceSummary)}
              disableRowSelectionOnClick
              rowHeight={42}
              slots={{ toolbar: GridToolbar }}
              showToolbar
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [{ field: "surname", sort: "asc" }],
                },
              }}
              sx={{
                height: "100%",
                backgroundColor: "background.paper",
              }}
            />
          </Box>
        )}
      </DashboardCard>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{selectedTenant ? `${selectedTenant.surname}, ${selectedTenant.name}` : "Teilnahmen"}</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : !selectedTenantDetails || selectedTenantDetails.scanned_sessions.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Keine besuchten Sessions vorhanden.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Session</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Teile</TableCell>
                  <TableCell>Manuell</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedTenantDetails.scanned_sessions.map((session) => (
                  <TableRow key={session.session_id}>
                    <TableCell>{session.session_title}</TableCell>
                    <TableCell>{new Date(session.session_date).toLocaleDateString()}</TableCell>
                    <TableCell>{[...session.parts_attended].sort((a, b) => a - b).join(", ")}</TableCell>
                    <TableCell>{session.has_manual_override ? "Ja" : "Nein"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BaseAttendanceOverviewPage;
