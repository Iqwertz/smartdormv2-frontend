// src/components/engagements/TenantEngagementTable.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { fetchTenantOverviewData } from "../../services/engagementService";
import { Engagement, TenantOverview } from "../../types/tenant";
import { GridToolbar } from "@mui/x-data-grid/internals";
import VisibilityIcon from "@mui/icons-material/Visibility";

const TenantEngagementTableMinimal: React.FC = () => {
  const [rows, setRows] = useState<TenantOverview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<TenantOverview | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTenantOverviewData()
      .then((data) => {
        setRows(data);
        setError(null);
      })
      .catch(() => setError("Bewohnerübersicht konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  const handleShowDetails = (tenant: TenantOverview) => {
    setSelectedTenant(tenant);
  };

  const handleCloseModal = () => {
    setSelectedTenant(null);
  };

  const columns: GridColDef<TenantOverview>[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Referate",
      width: 80,
      cellClassName: "actions",
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            icon={<VisibilityIcon />}
            label="Engagements anzeigen"
            onClick={() => handleShowDetails(row)}
            color="inherit"
          />,
        ];
      },
    },
    { field: "surname", headerName: "Nachname", width: 140 },
    { field: "name", headerName: "Vorname", width: 140 },
    { field: "email", headerName: "E-Mail", width: 200 },
    { field: "tel_number", headerName: "Telefon", width: 150, sortable: false },
    {
      field: "move_out",
      headerName: "Auszug",
      width: 120,
      type: "date",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    { field: "current_room", headerName: "Zimmer", width: 100 },
    {
      field: "current_points",
      headerName: "Punkte",
      type: "number",
      width: 90,
    },
  ];

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Box sx={{ width: "100%", height: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          onRowClick={(params) => handleShowDetails(params.row)}
          showToolbar
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
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

      <Dialog open={!!selectedTenant} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Referate für {selectedTenant?.name} {selectedTenant?.surname}
        </DialogTitle>
        <DialogContent dividers>
          {selectedTenant && selectedTenant.engagements.length > 0 ? (
            <List dense>
              {selectedTenant.engagements.map((eng: Engagement) => (
                <ListItem key={eng.id} divider>
                  <ListItemText
                    primary={`${eng.department.full_name} - ${eng.semester}`}
                    secondary={`Punkte: ${eng.points} | Entlastet: ${eng.compensate ? "Ja" : "Nein"}${
                      eng.note ? ` | Notiz: ${eng.note}` : ""
                    }`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ p: 2 }} color="text.secondary">
              Keine Ämter für diesen Bewohner erfasst.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TenantEngagementTableMinimal;
