import React, { useState, useEffect } from "react";
import { Box, Alert, Button } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import { SubtenantProfile } from "../../types/tenant";
import apiClient from "../../services/api";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import { GridToolbar } from "@mui/x-data-grid/internals";

interface SubtenantDataTableProps {
  status: "current" | "future" | "all";
}

const SubtenantDataTable: React.FC<SubtenantDataTableProps> = ({ status }) => {
  const [subtenants, setSubtenants] = useState<SubtenantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<SubtenantProfile[]>("/api/department/subtenants/list/", {
        params: { status },
      })
      .then((response) => {
        setSubtenants(response.data);
      })
      .catch((err) => {
        setError(`Untermieter (${status}) konnten nicht geladen werden.`);
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [status]);

  const columns: GridColDef<SubtenantProfile>[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Aktionen",
      width: 100,
      getActions: ({ row }) => [
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
    {
      field: "move_in",
      headerName: "Einzug",
      width: 120,
      type: "date",
      valueGetter: (value) => dayjs(value).toDate(),
    },
    {
      field: "move_out",
      headerName: "Auszug",
      width: 120,
      type: "date",
      valueGetter: (value) => dayjs(value).toDate(),
    },
    { field: "university_confirmation", headerName: "Uni-Bestätigung", width: 150, type: "boolean" },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box
        sx={{ display: "flex", justifyContent: "flex-end", px: 2, pt: 1, position: "absolute", bottom: 8, right: 0 }}
      >
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/department/new-subtenant")}>
          Neuer Untermieter
        </Button>
      </Box>
      <DataGrid
        rows={subtenants}
        columns={columns}
        loading={loading}
        slots={{ toolbar: GridToolbar }}
        initialState={{
          sorting: { sortModel: [{ field: "move_in", sort: "desc" }] },
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        showToolbar
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
      />
    </Box>
  );
};

export default SubtenantDataTable;
