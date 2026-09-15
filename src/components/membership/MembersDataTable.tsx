import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, FormControlLabel, Stack, Switch, Tooltip } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridToolbar } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import dayjs from "dayjs";
import { Membership } from "../../types/membership";
import { fetchMemberIban, fetchMembers } from "../../services/membershipService";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import DirectDebitDialog from "./DirectDebitDialog";

const FINANCE_GROUPS = ["Finanzenreferat", "ADMIN"];

interface MembersDataTableProps {
  refreshTrigger?: number;
}

/**
 * The HSV member register: Beitrittsdatum, Mandatsnummer and IBAN per member.
 *
 * IBANs arrive masked. Revealing one is a separate request that the server logs with the
 * acting user, which is what the privacy notice in the Beitrittserklärung promises.
 */
const MembersDataTable: React.FC<MembersDataTableProps> = ({ refreshTrigger = 0 }) => {
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeEnded, setIncludeEnded] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, string>>({});
  const [debitOpen, setDebitOpen] = useState(false);
  const { showNotification } = useNotification();
  const { authState } = useAuth();

  const isFinance = (authState.user?.groups || []).some((g) => FINANCE_GROUPS.includes(g));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMembers(await fetchMembers(includeEnded));
      // Drop any revealed numbers on reload so they do not linger on screen.
      setRevealed({});
    } catch {
      setError("Die Mitgliederliste konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [includeEnded]);

  useEffect(() => {
    load();
  }, [load, refreshTrigger]);

  const handleReveal = async (tenantId: number) => {
    try {
      const data = await fetchMemberIban(tenantId);
      setRevealed((prev) => ({ ...prev, [tenantId]: data.iban }));
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Die IBAN konnte nicht geladen werden.", "error");
    }
  };

  const columns: GridColDef<Membership>[] = [
    { field: "surname", headerName: "Nachname", width: 150, valueGetter: (_, row) => row.tenant.surname },
    { field: "name", headerName: "Vorname", width: 140, valueGetter: (_, row) => row.tenant.name },
    { field: "room", headerName: "Zimmer", width: 90, valueGetter: (_, row) => row.tenant.current_room },
    {
      field: "joined_on",
      headerName: "Beitrittsdatum",
      width: 140,
      type: "date",
      valueGetter: (value) => dayjs(value).toDate(),
    },
    { field: "mandate_reference", headerName: "Mandatsnummer", width: 170 },
    {
      field: "iban",
      headerName: "IBAN",
      width: 230,
      sortable: false,
      filterable: false,
      valueGetter: (_, row) => revealed[row.tenant.id] || row.iban_masked,
    },
    {
      field: "mandate_status_display",
      headerName: "Mandat",
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={params.row.mandate_status === "ACTIVE" ? "success" : "default"}
          variant={params.row.mandate_status === "ACTIVE" ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "sequence_type",
      headerName: "Nächster Einzug",
      width: 140,
      renderCell: (params) => (
        <Tooltip title={params.value === "FRST" ? "Erstlastschrift" : "Folgelastschrift"}>
          <span>{params.value}</span>
        </Tooltip>
      ),
    },
    {
      field: "last_collection_on",
      headerName: "Letzter Einzug",
      width: 140,
      type: "date",
      valueGetter: (value) => (value ? dayjs(value).toDate() : null),
    },
    {
      field: "ended_on",
      headerName: "Beendet am",
      width: 130,
      type: "date",
      valueGetter: (value) => (value ? dayjs(value).toDate() : null),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 60,
      getActions: (params) =>
        params.row.iban_masked
          ? [
              <GridActionsCellItem
                key="reveal"
                icon={
                  <Tooltip title="Vollständige IBAN anzeigen (wird protokolliert)">
                    <VisibilityIcon />
                  </Tooltip>
                }
                label="IBAN anzeigen"
                onClick={() => handleReveal(params.row.tenant.id)}
                disabled={Boolean(revealed[params.row.tenant.id])}
              />,
            ]
          : [],
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 400 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
        <FormControlLabel
          control={<Switch checked={includeEnded} onChange={(e) => setIncludeEnded(e.target.checked)} />}
          label="Beendete Mitgliedschaften anzeigen"
        />
        <Box sx={{ flexGrow: 1 }} />
        {isFinance && (
          <Button variant="contained" startIcon={<ReceiptLongIcon />} onClick={() => setDebitOpen(true)}>
            SEPA-Einzug erstellen
          </Button>
        )}
      </Stack>

      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          rows={members}
          columns={columns}
          getRowId={(row) => row.tenant.id}
          slots={{ toolbar: GridToolbar }}
          showToolbar
          initialState={{ sorting: { sortModel: [{ field: "surname", sort: "asc" }] } }}
          pageSizeOptions={[25, 50, 100]}
          density="compact"
        />
      </Box>

      {isFinance && (
        <DirectDebitDialog
          open={debitOpen}
          onClose={() => setDebitOpen(false)}
          onCreated={() => {
            setDebitOpen(false);
            load();
          }}
        />
      )}
    </Box>
  );
};

export default MembersDataTable;
