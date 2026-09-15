import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { optOutOfMembershipPrompt } from "../../../../services/membershipService";
import { useNotification } from "../../../../context/NotificationContext";

interface MembershipJoinPopupProps {
  open: boolean;
  /** Dismiss for this session only. */
  onClose: () => void;
  /** Called after a successful permanent opt-out, so the dashboard stops offering it. */
  onOptedOut: () => void;
  fee?: string;
}

/**
 * Invites a tenant to join the HSV e.V.
 *
 * Joining is voluntary, so the dialog offers three genuine answers: join now, decide later,
 * and stop asking. "Stop asking" is recorded server-side - anything less would mean the
 * dialog reappears at every login for someone who has already said no.
 */
const MembershipJoinPopup: React.FC<MembershipJoinPopupProps> = ({ open, onClose, onOptedOut, fee = "10,00" }) => {
  const [isOptingOut, setIsOptingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleOptOut = async () => {
    setIsOptingOut(true);
    setError(null);
    try {
      const response = await optOutOfMembershipPrompt();
      showNotification(response.message, "success");
      onOptedOut();
    } catch (err: any) {
      const message = err.response?.data?.error || "Aktion fehlgeschlagen.";
      setError(message);
      showNotification(message, "error");
    } finally {
      setIsOptingOut(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Werde Mitglied im HSV e.V.</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Der <strong>Studierendenwohnheim Geschwister Scholl Heimselbstverwaltung e.V.</strong> ist die studentische
          Selbstverwaltung des Schollheims. Als Mitglied kannst du mitbestimmen, wie das Heim organisiert wird, und die
          Angebote des Vereins mitgestalten.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Der Mitgliedsbeitrag beträgt derzeit <strong>{fee} €</strong> pro Monat. Im nächsten Schritt gibst du deine
            Beitrittserklärung und - wenn du möchtest - dein SEPA-Lastschriftmandat ab.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Deine Mitgliedschaft endet automatisch mit deinem Auszug. Eine gesonderte Kündigung ist nicht nötig.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1, px: 3, pb: 2 }}>
        <Button onClick={handleOptOut} disabled={isOptingOut} color="inherit" size="small">
          {isOptingOut ? <CircularProgress size={18} /> : "Nicht mehr fragen"}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose} disabled={isOptingOut}>
          Später
        </Button>
        <Button variant="contained" onClick={() => navigate("/mitgliedschaft/beitritt")} disabled={isOptingOut}>
          Jetzt beitreten
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MembershipJoinPopup;
