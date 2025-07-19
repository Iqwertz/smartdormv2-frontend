import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Departure, DepartmentSignature } from "../../types/tenant";
import { fetchDeparturesForSigning } from "../../services/departureService";
import { useAuth } from "../../context/AuthContext";
import SignDepartureDialog from "../../components/admin/departures/SignDepartureDialog";
import DashboardCard from "../../components/shared/DashboardCard";
import dayjs from "dayjs";
import { useNotification } from "../../context/NotificationContext";

const DepartureSigningPage: React.FC = () => {
  const { authState } = useAuth();
  const { showNotification } = useNotification();
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<DepartmentSignature | null>(null);

  const userGroups = authState.user?.groups || [];

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeparturesForSigning();
      setDepartures(data);
    } catch (err) {
      setError("Daten konnten nicht geladen werden.");
      showNotification("Daten konnten nicht geladen werden.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (departure: Departure) => {
    // Find the signature for the user's department(s) that is not signed yet
    const signatureToSign = departure.signatures.find(
      (sig) => userGroups.includes(sig.department_name) && !sig.signed_on
    );
    if (signatureToSign) {
      setSelectedSignature(signatureToSign);
      setDialogOpen(true);
    } else {
      showNotification("Keine Freigabe für Ihre Abteilung für diesen Auszug erforderlich.", "info");
    }
  };

  const handleCloseDialog = (refresh: boolean) => {
    setDialogOpen(false);
    setSelectedSignature(null);
    if (refresh) {
      loadData();
    }
  };

  const columns: GridColDef<Departure>[] = [
    {
      field: "actions",
      headerName: "Aktion",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <button onClick={() => handleOpenDialog(params.row)} className="MuiButton-root MuiButton-text">
          Freigeben
        </button>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
      valueGetter: (value, row) => `${row.tenant.name} ${row.tenant.surname}`,
    },
    { field: "email", headerName: "E-Mail", width: 250, valueGetter: (value, row) => row.tenant.email },
    { field: "current_room", headerName: "Zimmer", width: 100, valueGetter: (value, row) => row.tenant.current_room },
    {
      field: "move_out",
      headerName: "Auszugsdatum",
      width: 150,
      type: "date",
      valueGetter: (value, row) => dayjs(row.tenant.move_out).toDate(),
    },
    {
      field: "your_signature",
      headerName: "Ihre Freigabe",
      width: 200,
      valueGetter: (value, row) => {
        const sig = row.signatures.find((s) => userGroups.includes(s.department_name));
        return sig?.signed_on ? `Freigegeben am ${dayjs(sig.signed_on).format("DD.MM.YY")}` : "Ausstehend";
      },
    },
  ];

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
      <DashboardCard
        title="Auszüge zur Freigabe"
        cardSx={{ height: "calc(100vh - 64px - 2rem)", p: 2 }}
        contentSx={{ height: "100%" }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <DataGrid
          rows={departures}
          columns={columns}
          getRowId={(row) => row.tenant.id}
          loading={loading}
          autoHeight
          initialState={{
            sorting: {
              sortModel: [{ field: "move_out", sort: "asc" }],
            },
          }}
        />
      </DashboardCard>
      {selectedSignature && (
        <SignDepartureDialog open={dialogOpen} onClose={handleCloseDialog} signature={selectedSignature} />
      )}
    </Box>
  );
};

export default DepartureSigningPage;
