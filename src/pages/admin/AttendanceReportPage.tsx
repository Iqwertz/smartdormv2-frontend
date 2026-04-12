import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Pagination,
  TextField
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import attendanceService, { AttendanceReportTenant } from "../../services/attendanceService";

const AttendanceReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [report, setReport] = useState<AttendanceReportTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchReport = () => {
    if (!sessionId) return;
    setLoading(true);
    attendanceService.getReport(parseInt(sessionId, 10))
      .then(res => setReport(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const handleOverride = (tenantId: number, part: number, isPresent: boolean) => {
    if (!sessionId) return;
    attendanceService.manualOverride(parseInt(sessionId, 10), tenantId, part, !isPresent)
      .then(() => fetchReport())
      .catch(console.error);
  };

  const filteredReport = report.filter(r => r.tenant_name.toLowerCase().includes(search.toLowerCase()));
  const itemsPerPage = 25;
  const paginatedReport = filteredReport.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const maxParts = 3; // TODO: Ideally fetched from event details

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Anwesenheitsreport (Session {sessionId})</Typography>
      
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField 
          label="Suchen" 
          variant="outlined" 
          size="small" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mieter</TableCell>
              {[...Array(maxParts)].map((_, i) => (
                <TableCell key={i} align="center">Part {i + 1}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReport.map((row) => (
              <TableRow key={row.tenant_id}>
                <TableCell component="th" scope="row">
                  {row.tenant_name}
                </TableCell>
                {[...Array(maxParts)].map((_, i) => {
                  const partNum = i + 1;
                  const isPresent = row.parts_attended.includes(partNum);
                  const isOverride = row.manual_overrides.includes(partNum);

                  return (
                    <TableCell key={partNum} align="center" padding="checkbox">
                      <Checkbox 
                        checked={isPresent} 
                        onChange={() => handleOverride(row.tenant_id, partNum, isPresent)}
                        color={isOverride ? "warning" : "primary"}
                        icon={<CancelIcon color="disabled" />}
                        checkedIcon={<CheckCircleIcon />}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination 
          count={Math.ceil(filteredReport.length / itemsPerPage)} 
          page={page} 
          onChange={(e, val) => setPage(val)} 
          color="primary" 
        />
      </Box>
    </Container>
  );
};

export default AttendanceReportPage;
