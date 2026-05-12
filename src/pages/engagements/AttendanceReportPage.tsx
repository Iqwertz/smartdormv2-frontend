import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import attendanceService, { AttendanceReportTenant } from "../../services/attendanceService";
import DashboardCard from "../../components/shared/DashboardCard";
import { GridToolbar } from "@mui/x-data-grid/internals";

const AttendanceReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [report, setReport] = useState<AttendanceReportTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [partsCount, setPartsCount] = useState(0);
  const [requiredParts, setRequiredParts] = useState(0);
  const [sessionTitle, setSessionTitle] = useState<string>("Anwesenheitsreport");

  const fetchReport = useCallback(() => {
    if (!sessionId) return;
    setLoading(true);
    attendanceService
      .getReport(parseInt(sessionId, 10))
      .then((res) => {
        const payload = res.data as unknown as
          | {
              rows: AttendanceReportTenant[];
              session: { title: string; event_details: { parts_count: number; required_parts: number } };
            }
          | AttendanceReportTenant[];

        if (Array.isArray(payload)) {
          setReport(payload);
          setPartsCount(0);
          setRequiredParts(0);
          setSessionTitle(`Session ${sessionId}`);
          return;
        }

        setReport(payload.rows);
        setPartsCount(payload.session.event_details.parts_count);
        setRequiredParts(payload.session.event_details.required_parts);
        setSessionTitle(payload.session.title || `Session ${sessionId}`);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleOverride = useCallback(
    (tenantId: number, part: number, isPresent: boolean) => {
      if (!sessionId) return;
      attendanceService
        .manualOverride(parseInt(sessionId, 10), tenantId, part, !isPresent)
        .then(() => fetchReport())
        .catch(console.error);
    },
    [fetchReport, sessionId],
  );

  const attendanceCountsByPart = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 1; i <= partsCount; i++) {
      counts[i] = report.filter((r) => r.parts_attended.includes(i)).length;
    }
    return counts;
  }, [report, partsCount]);

  const columns = useMemo<GridColDef[]>(() => {
    const cols: GridColDef[] = [
      {
        field: "attendance_status",
        headerName: "Status",
        width: 90,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const row = params.row as AttendanceReportTenant;
          const attendedCount = row.parts_attended.length;
          const isComplete = requiredParts > 0 ? attendedCount >= requiredParts : attendedCount > 0;

          return (
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: isComplete ? "success.main" : "error.main",
                boxShadow: 1,
                margin: "auto",
                position: "relative",
                top: "calc(50% - 5px)",
              }}
            />
          );
        },
      },
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
    ];

    for (let i = 0; i < partsCount; i++) {
      const partNum = i + 1;
      cols.push({
        field: `part_${partNum}`,
        headerName: `Part ${partNum} (${attendanceCountsByPart[partNum] || 0})`,
        width: 120,
        sortable: true,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",
        sortComparator: (v1, v2, cellParams1, cellParams2) => {
          const row1 = cellParams1.api.getRow(cellParams1.id) as AttendanceReportTenant;
          const row2 = cellParams2.api.getRow(cellParams2.id) as AttendanceReportTenant;

          if (!row1 || !row2) return 0;

          const isPresent1 = row1.parts_attended.includes(partNum);
          const isOverride1 = row1.manual_overrides.includes(partNum);

          const isPresent2 = row2.parts_attended.includes(partNum);
          const isOverride2 = row2.manual_overrides.includes(partNum);

          // Priority: attended (3) > manually registered (2) > not attended (1)
          const getPriority = (isPresent: boolean, isOverride: boolean) => (isPresent ? 3 : isOverride ? 2 : 1);

          const priority1 = getPriority(isPresent1, isOverride1);
          const priority2 = getPriority(isPresent2, isOverride2);

          return priority2 - priority1; // Descending order
        },
        renderCell: (params) => {
          const row = params.row as AttendanceReportTenant;
          const isPresent = row.parts_attended.includes(partNum);
          const isOverride = row.manual_overrides.includes(partNum);

          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                cursor: "pointer",
                position: "relative",
                top: "calc(50% - 12px)",
              }}
              onClick={() => handleOverride(row.tenant_id, partNum, isPresent)}
            >
              {isPresent ? (
                <CheckCircleIcon sx={{ color: isOverride ? "warning.main" : "success.main" }} />
              ) : (
                <CancelIcon color="disabled" />
              )}
            </Box>
          );
        },
      });
    }

    return cols;
  }, [partsCount, requiredParts, handleOverride, attendanceCountsByPart]);

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
        title={`${sessionTitle} · Anwesenheitsreport`}
        cardSx={{ height: "100%", display: "flex", flexDirection: "column" }}
        contentSx={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: 2, height: "100%" }}
      >
        <Box sx={{ flexGrow: 1, height: "100%", minHeight: 0 }}>
          <DataGrid
            rows={report}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.tenant_id}
            disableRowSelectionOnClick
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
      </DashboardCard>
    </Box>
  );
};

export default AttendanceReportPage;
