import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, TextField, Checkbox } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import attendanceService, { AttendanceReportTenant } from "../../services/attendanceService";
import DashboardCard from "../../components/shared/DashboardCard";

const AttendanceReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [report, setReport] = useState<AttendanceReportTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReport = () => {
    if (!sessionId) return;
    setLoading(true);
    attendanceService
      .getReport(parseInt(sessionId, 10))
      .then((res) => setReport(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const handleOverride = (tenantId: number, part: number, isPresent: boolean) => {
    if (!sessionId) return;
    attendanceService
      .manualOverride(parseInt(sessionId, 10), tenantId, part, !isPresent)
      .then(() => fetchReport())
      .catch(console.error);
  };

  const filteredReport = report.filter((r) =>
    r.tenant_name.toLowerCase().includes(search.toLowerCase())
  );

  const maxParts = 3; // Ideally fetched from event details

  const columns = useMemo<GridColDef[]>(() => {
    const cols: GridColDef[] = [
      {
        field: "tenant_name",
        headerName: "Mieter",
        flex: 1,
        minWidth: 200,
      },
    ];

    for (let i = 0; i < maxParts; i++) {
      const partNum = i + 1;
      cols.push({
        field: `part_${partNum}`,
        headerName: `Part ${partNum}`,
        width: 100,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const row = params.row as AttendanceReportTenant;
          const isPresent = row.parts_attended.includes(partNum);
          const isOverride = row.manual_overrides.includes(partNum);

          return (
             <Checkbox
               checked={isPresent}
               onChange={() => handleOverride(row.tenant_id, partNum, isPresent)}
               color={isOverride ? "warning" : "primary"}
               icon={<CancelIcon color="disabled" />}
               checkedIcon={<CheckCircleIcon />}
             />
          );
        },
      });
    }

    return cols;
  }, [sessionId, handleOverride]); // Dependencies for columns

  return (
    <Box sx={{ maxWidth: "1600px", margin: "0 auto", height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }} className="page-root">
      <DashboardCard
        title={`Anwesenheitsreport (Session ${sessionId})`}
        cardSx={{ height: "100%", display: "flex", flexDirection: "column" }}
        contentSx={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: 2, height: "100%" }}
      >
        <Box sx={{ display: "flex", mb: 2 }}>
          <TextField
            label="Suchen"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>

        <Box sx={{ flexGrow: 1, height: "100%", minHeight: 0 }}>
          <DataGrid
            rows={filteredReport}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.tenant_id}
            disableRowSelectionOnClick
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
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
