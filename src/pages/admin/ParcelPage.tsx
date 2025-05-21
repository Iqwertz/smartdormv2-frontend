import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Autocomplete,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DashboardCard from "../../components/tenants/dashboard/DashboardCard";
import { TenantForSelect, Parcel, CreateParcelPayload } from "../../types/parcel";
import {
  fetchTenantsForSelect,
  createParcel,
  fetchPendingParcels,
  markParcelAsPickedUp,
} from "../../services/parcelService";
import { useNotification } from "../../context/NotificationContext";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import dayjs from "dayjs";

const ParcelPage: React.FC = () => {
  const [tenants, setTenants] = useState<TenantForSelect[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantForSelect | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [pendingParcels, setPendingParcels] = useState<Parcel[]>([]);

  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  const [loadingParcels, setLoadingParcels] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [parcelsError, setParcelsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { showNotification } = useNotification();

  const loadTenants = useCallback(async () => {
    setLoadingTenants(true);
    try {
      const data = await fetchTenantsForSelect();
      setTenants(data);
    } catch (error) {
      console.error("Failed to fetch tenants", error);
      showNotification("Mieterliste konnte nicht geladen werden.", "error");
    } finally {
      setLoadingTenants(false);
    }
  }, [showNotification]);

  const loadPendingParcels = useCallback(async () => {
    setLoadingParcels(true);
    setParcelsError(null);
    try {
      const data = await fetchPendingParcels();
      setPendingParcels(data);
    } catch (error) {
      console.error("Failed to fetch pending parcels", error);
      setParcelsError("Ausstehende Pakete konnten nicht geladen werden.");
      showNotification("Ausstehende Pakete konnten nicht geladen werden.", "error");
    } finally {
      setLoadingParcels(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadTenants();
    loadPendingParcels();
  }, [loadTenants, loadPendingParcels]);

  const handleCreateParcel = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!selectedTenant) {
      setFormError("Bitte wählen Sie einen Mieter aus.");
      return;
    }
    if (quantity < 1) {
      setFormError("Die Paketmenge muss mindestens 1 sein.");
      return;
    }

    setIsSubmitting(true);
    const payload: CreateParcelPayload = {
      quantity,
      registered: isRegistered,
    };

    if (selectedTenant.current_room) {
      payload.room = selectedTenant.current_room;
    } else if (selectedTenant.name && selectedTenant.surname) {
      payload.name = selectedTenant.name;
      payload.surname = selectedTenant.surname;
    } else {
      setFormError("Ausgewählter Mieter hat weder Zimmer noch vollständigen Namen.");
      setIsSubmitting(false);
      return;
    }

    try {
      await createParcel(payload);
      showNotification("Paket erfolgreich hinzugefügt!", "success");
      // Reset form
      setSelectedTenant(null);
      setQuantity(1);
      setIsRegistered(false);
      // Reload pending parcels
      loadPendingParcels();
    } catch (error: any) {
      console.error("Failed to create parcel", error);
      setFormError(error.response?.data?.error || "Paket konnte nicht hinzugefügt werden.");
      showNotification(error.response?.data?.error || "Paket konnte nicht hinzugefügt werden.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPickedUp = async (externalId: string) => {
    try {
      await markParcelAsPickedUp(externalId);
      showNotification("Paket als abgeholt markiert.", "success");
      loadPendingParcels(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to mark parcel as picked up", error);
      showNotification(error.response?.data?.error || "Fehler beim Markieren des Pakets.", "error");
    }
  };

  const parcelColumns: GridColDef<Parcel>[] = [
    {
      field: "recipient",
      headerName: "Empfänger",
      flex: 2,
      valueGetter: (value, row) => row.tenant_info || row.subtenant_info || "Unbekannt",
    },
    {
      field: "arrived",
      headerName: "Angekommen am",
      flex: 1.5,
      type: "dateTime",
      valueGetter: (value) => (value ? dayjs(value).toDate() : null),
      renderCell: (params) => (params.value ? dayjs(params.value).format("DD.MM.YYYY HH:mm") : "N/A"),
    },
    { field: "count", headerName: "Menge", type: "number", flex: 0.5 },
    {
      field: "registered",
      headerName: "Einschreiben",
      type: "boolean",
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Aktionen",
      flex: 1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<CheckCircleOutlineIcon />}
          label="Als abgeholt markieren"
          onClick={() => handleMarkAsPickedUp(params.row.external_id)}
          key={`pickup-${params.row.external_id}`}
        />,
      ],
    },
  ];

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "calc(100vh - 32px)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <DashboardCard title="Paket hinzufügen">
        <Box component="form" onSubmit={handleCreateParcel} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Autocomplete
            options={tenants}
            getOptionLabel={(option) => option.label || `${option.name} ${option.surname}`}
            value={selectedTenant}
            onChange={(_, newValue) => setSelectedTenant(newValue)}
            loading={loadingTenants}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Mieter auswählen"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingTenants ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <TextField
            label="Anzahl Pakete"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            InputProps={{ inputProps: { min: 1 } }}
            variant="outlined"
          />
          <FormControlLabel
            control={<Checkbox checked={isRegistered} onChange={(e) => setIsRegistered(e.target.checked)} />}
            label="Einschreiben"
          />
          {formError && <Alert severity="error">{formError}</Alert>}
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || loadingTenants}>
            {isSubmitting ? <CircularProgress size={24} /> : "Paket hinzufügen"}
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard
        title="Ausstehende Pakete"
        cardSx={{ flexGrow: 1, height: "100%", display: "flex", flexDirection: "column" }}
        contentSx={{ flexGrow: 1, height: "100%" }}
      >
        {parcelsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {parcelsError}
          </Alert>
        )}
        <Box sx={{ height: "calc(100% - 40px)", width: "100%" }}>
          {" "}
          <DataGrid
            rows={pendingParcels}
            columns={parcelColumns}
            loading={loadingParcels}
            getRowId={(row) => row.external_id}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: "arrived", sort: "desc" }] },
            }}
            pageSizeOptions={[5, 10, 25]}
            autoHeight={false}
            sx={{ minHeight: 300 }}
          />
        </Box>
      </DashboardCard>
    </Box>
  );
};

export default ParcelPage;
