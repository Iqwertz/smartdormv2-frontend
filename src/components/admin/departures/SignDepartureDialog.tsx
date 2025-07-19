import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DepartmentSignature, SignSignaturePayload } from "../../../types/tenant";
import { signSignature } from "../../../services/departureService";
import { useNotification } from "../../../context/NotificationContext";

interface SignDepartureDialogProps {
  open: boolean;
  onClose: (refresh: boolean) => void;
  signature: DepartmentSignature;
}

const SignDepartureDialog: React.FC<SignDepartureDialogProps> = ({ open, onClose, signature }) => {
  const [amount, setAmount] = useState<string>("0.00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    const payload: SignSignaturePayload = {
      amount: parseFloat(amount),
    };
    try {
      await signSignature(signature.id, payload);
      showNotification("Freigabe erfolgreich gespeichert.", "success");
      onClose(true); // Close and refresh
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Fehler beim Speichern der Freigabe.";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Freigabe für {signature.department_name}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="amount"
          label="Offener Betrag (€)"
          type="number"
          fullWidth
          variant="standard"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputProps={{
            step: "0.01",
            min: "0.00",
          }}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Abbrechen</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : "Freigeben"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignDepartureDialog;
