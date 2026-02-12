// src/components/admin/TenantDataTable.tsx
import React, { useState, useEffect, useRef } from "react";
import { Box, Alert } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/api";
import { TenantProfile } from "../../types/tenant";
import { GridToolbar } from "@mui/x-data-grid/internals";
interface TenantDataTableProps {
  status?: string;
  title?: string; // Optional title for different contexts
}

const TenantDataTable: React.FC<TenantDataTableProps> = ({ status = "current", title }) => {
  const [rows, setRows] = useState<TenantProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<TenantProfile[]>("/api/department/tenant-data", {
        params: {
          status: status, // Use the prop value
        },
      })
      .then((response) => {
        setRows(response.data);
      })
      .catch((err) => {
        console.error("Failed to fetch tenant data:", err);
        setError("Mieterdaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [status]); // Add status to dependency array

  const handleEditClick = (id: number) => {
    navigate(`/department/edit-tenant/${id}`);
  };

  const handleRowClick = (params: { id: number | string }, event: React.MouseEvent) => {
    // Check if text is selected
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    // Check if mouse moved significantly (indicating a drag/selection)
    if (mouseDownPos.current) {
      const dx = Math.abs(event.clientX - mouseDownPos.current.x);
      const dy = Math.abs(event.clientY - mouseDownPos.current.y);
      if (dx > 5 || dy > 5) {
        return;
      }
    }

    navigate(`/department/edit-tenant/${params.id}`);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    mouseDownPos.current = { x: event.clientX, y: event.clientY };
  };

  const columns: GridColDef<TenantProfile>[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Aktionen",
      width: 80,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEditClick(id as number)}
            color="inherit"
          />,
        ];
      },
    },
    { field: "surname", headerName: "Nachname", width: 140 },
    { field: "name", headerName: "Vorname", width: 140 },
    { field: "current_room", headerName: "Zimmer", width: 100 },
    { field: "current_floor", headerName: "Flur", width: 80 },
    { field: "extension", headerName: "Verlängerungen", type: "number", width: 120 },
    { field: "sublet", headerName: "Untermiete (Monate)", type: "number", width: 150 },
    { field: "username", headerName: "Benutzername", width: 130 },
    { field: "email", headerName: "E-Mail", width: 200 },
    {
      field: "birthday",
      headerName: "Geburtstag",
      width: 120,
      type: "date",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    { field: "gender", headerName: "Geschlecht", width: 110 },
    { field: "nationality", headerName: "Nationalität", width: 130 },
    { field: "tel_number", headerName: "Telefon", width: 150, sortable: false },
    { field: "university", headerName: "Universität", width: 120 },
    { field: "study_field", headerName: "Studienfach", width: 160 },
    {
      field: "move_in",
      headerName: "Einzug",
      width: 120,
      type: "date",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    {
      field: "move_out",
      headerName: "Auszug",
      width: 120,
      type: "date",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    {
      field: "probation_end",
      headerName: "Probezeitende",
      width: 130,
      type: "date",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    {
      field: "deposit",
      headerName: "Kaution (€)",
      type: "number",
      width: 110,
    },
    {
      field: "current_points",
      headerName: "Punkte",
      type: "number",
      width: 90,
    },
    { field: "note", headerName: "Notiz", width: 200, sortable: false, hideable: true },
    { field: "new_address", headerName: "Neue Adresse", width: 220, sortable: false, hideable: true },
    { field: "id", headerName: "ID", width: 80, type: "number", hideable: true },
    { field: "external_id", headerName: "Externe ID", width: 150, hideable: true },
  ];

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ width: "100%", height: "100%" }} onMouseDown={handleMouseDown}>
      {title && <h2>{title}</h2>}
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        slots={{ toolbar: GridToolbar }}
        showToolbar
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        sx={{
          height: "100%",
          "& .MuiDataGrid-row": {
            cursor: "pointer",
          },
        }}
        onRowClick={handleRowClick}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
          sorting: {
            sortModel: [{ field: "surname", sort: "asc" }],
          },
          columns: {
            columnVisibilityModel: {
              external_id: false,
              note: false,
              new_address: false,
              id: false,
            },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default TenantDataTable;
