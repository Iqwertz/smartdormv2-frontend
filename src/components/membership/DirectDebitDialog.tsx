import React, { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { DirectDebitPreview } from "../../types/membership";
import { createDirectDebit, directDebitXmlUrl, previewDirectDebit } from "../../services/membershipService";
import { useNotification } from "../../context/NotificationContext";

interface DirectDebitDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

/**
 * Creates the monthly pain.008 file for the bank.
 *
 * Preview first, on purpose: generating the file marks every included member as collected,
 * which flips their next collection from FRST to RCUR. That is not something to discover
 * afterwards, so the run is only created once the Finanzenreferat has seen the list.
 */
const DirectDebitDialog: React.FC<DirectDebitDialogProps> = ({ open, onClose, onCreated }) => {
  const [collectionDate, setCollectionDate] = useState<Dayjs | null>(dayjs().add(1, "month").startOf("month"));
  const [amount, setAmount] = useState("");
  const [preview, setPreview] = useState<DirectDebitPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const handlePreview = useCallback(async () => {
    if (!collectionDate?.isValid()) {
      setError("Bitte gib ein gültiges Fälligkeitsdatum an.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPreview(null);
    try {
      setPreview(await previewDirectDebit(collectionDate.format("YYYY-MM-DD"), amount || undefined));
    } catch (err: any) {
      setError(err.response?.data?.error || "Die Vorschau konnte nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }, [collectionDate, amount]);

  const handleCreate = async () => {
    if (!collectionDate?.isValid()) return;
    setIsCreating(true);
    setError(null);
    try {
      const response = await createDirectDebit(collectionDate.format("YYYY-MM-DD"), amount || undefined);
      showNotification(response.message, "success");
      // Hand the file straight to the browser - it is the whole point of the run.
      window.open(directDebitXmlUrl(response.run.id), "_blank");
      setPreview(null);
      onCreated();
    } catch (err: any) {
      const message = err.response?.data?.error || "Die SEPA-Datei konnte nicht erstellt werden.";
      setError(message);
      showNotification(message, "error");
    } finally {
      setIsCreating(false);
    }
  };

  const canCreate = Boolean(preview && preview.member_count > 0 && !preview.config_error);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>SEPA-Einzug erstellen</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Erzeugt eine pain.008-Datei mit dem Mitgliedsbeitrag aller Mitglieder mit gültigem Lastschriftmandat. Die
          Datei wird anschließend im Online-Banking eingereicht.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <DatePicker
            label="Fälligkeitsdatum"
            value={collectionDate}
            onChange={setCollectionDate}
            format="DD.MM.YYYY"
            slotProps={{ textField: { fullWidth: true } }}
          />
          <TextField
            label="Betrag je Mitglied (€)"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Standardbeitrag"
            helperText="Leer lassen für den hinterlegten Mitgliedsbeitrag"
          />
          <Button variant="outlined" onClick={handlePreview} disabled={isLoading} sx={{ minWidth: 140, height: 56 }}>
            {isLoading ? <CircularProgress size={22} /> : "Vorschau"}
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {preview && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            {preview.config_error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {preview.config_error}
              </Alert>
            )}

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
              <Chip label={`${preview.member_count} Mitglieder`} />
              <Chip label={`${preview.total_amount} € gesamt`} color="primary" />
              <Chip label={`${preview.first_collections}× FRST`} variant="outlined" />
              <Chip label={`${preview.recurring_collections}× RCUR`} variant="outlined" />
              {preview.skipped_members > 0 && (
                <Chip
                  label={`${preview.skipped_members} ohne gültiges Mandat übersprungen`}
                  color="warning"
                  variant="outlined"
                />
              )}
            </Stack>

            {preview.items.length > 0 && (
              <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Mandatsnummer</TableCell>
                      <TableCell>IBAN</TableCell>
                      <TableCell>Sequenz</TableCell>
                      <TableCell align="right">Betrag</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.items.map((item) => (
                      <TableRow key={item.tenant_id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.mandate_reference}</TableCell>
                        <TableCell>{item.iban_masked}</TableCell>
                        <TableCell>{item.sequence_type}</TableCell>
                        <TableCell align="right">{item.amount} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isCreating}>
          Abbrechen
        </Button>
        <Button variant="contained" onClick={handleCreate} disabled={!canCreate || isCreating}>
          {isCreating ? <CircularProgress size={22} /> : "Datei erzeugen und herunterladen"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DirectDebitDialog;
