import React, { useState, useEffect } from "react";
import { Box, Button, CircularProgress, Alert } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DashboardCard from "../../components/tenants/dashboard/DashboardCard";
import { SubtenantProfile } from "../../types/tenant";
import apiClient from "../../services/api";
import dayjs from "dayjs";

const SubtenantPage: React.FC = () => {
  const [subtenants, setSubtenants] = useState<SubtenantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get<SubtenantProfile[]>("/api/department/subtenants/list/")
      .then((response) => {
        setSubtenants(response.data);
      })
      .catch((err) => {
        setError("Untermieter konnten nicht geladen werden.");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns: GridColDef<SubtenantProfile>[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Aktionen",
      width: 100,
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Bearbeiten"
          onClick={() => navigate(`/department/edit-subtenant/${id}`)}
        />,
      ],
    },
    { field: "name", headerName: "Vorname", width: 150 },
    { field: "surname", headerName: "Nachname", width: 150 },
    { field: "email", headerName: "E-Mail", width: 220 },
    { field: "room_name", headerName: "Zimmer", width: 100 },
    { field: "tenant_name", headerName: "Hauptmieter", width: 200 },
    { field: "move_in", headerName: "Einzug", width: 120, type: "date", valueGetter: (value) => dayjs(value).toDate() },
    {
      field: "move_out",
      headerName: "Auszug",
      width: 120,
      type: "date",
      valueGetter: (value) => dayjs(value).toDate(),
    },
    { field: "university_confirmation", headerName: "Uni-Bestätigung", width: 150, type: "boolean" },
  ];

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
      <DashboardCard title="Aktuelle Untermieter">
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/department/new-subtenant")}>
            Untermieter hinzufügen
          </Button>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ height: "70vh", width: "100%" }}>
          <DataGrid
            rows={subtenants}
            columns={columns}
            loading={loading}
            initialState={{
              sorting: { sortModel: [{ field: "surname", sort: "asc" }] },
            }}
          />
        </Box>
      </DashboardCard>
    </Box>
  );
};

export default SubtenantPage;
