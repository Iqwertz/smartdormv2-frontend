import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { Departure } from "../../../../types/tenant";
import { decideOnDeparture } from "../../../../services/departureService";
import { useNotification } from "../../../../context/NotificationContext";
import dayjs from "dayjs";

interface DepartureDecisionPopupProps {
  open: boolean;
  onClose: () => void;
  departure: Departure;
}

const DepartureDecisionPopup: React.FC<DepartureDecisionPopupProps> = ({ open, onClose, departure }) => {
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const handleDecision = async (decision: "CONFIRM" | "POSTPONE") => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (decision === "CONFIRM" && (!bankName || !iban)) {
        setError("Bitte geben Sie Kontoinhaber und IBAN an.");
        setIsSubmitting(false);
        return;
      }
      const response = await decideOnDeparture(decision, decision === "CONFIRM" ? { name: bankName, iban } : undefined);
      showNotification(response.message, "success");
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Aktion fehlgeschlagen.";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Dein Mietvertrag läuft bald aus</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Hallo {departure.tenant.name}, dein Mietvertrag im Schollheim endet planmäßig am{" "}
          <strong>{dayjs(departure.tenant.move_out).format("DD.MM.YYYY")}</strong>. Bitte teile uns mit, wie du
          verfahren möchtest.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Option 1: Leave */}
        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 1, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Ich möchte ausziehen
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Wenn du zum Vertragsende ausziehen möchtest, bestätige dies bitte hier und gib deine Bankverbindung für die
            Kautionsrückzahlung an.
          </Typography>
          <TextField
            label="Kontoinhaber/in"
            fullWidth
            margin="dense"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
          <TextField label="IBAN" fullWidth margin="dense" value={iban} onChange={(e) => setIban(e.target.value)} />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleDecision("CONFIRM")}
            disabled={isSubmitting}
            sx={{ mt: 1 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Auszug bestätigen"}
          </Button>
        </Box>

        {/* Option 2: Stay */}
        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Ich möchte eine Verlängerung beantragen
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Wenn du im Schollheim wohnen bleiben möchtest, kannst du hier den Prozess für eine Wohnzeitverlängerung
            starten. Die Verwaltung wird sich bei dir melden.
          </Typography>
          <Button variant="outlined" onClick={() => handleDecision("POSTPONE")} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Verlängerung beantragen"}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Später entscheiden</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepartureDecisionPopup;
