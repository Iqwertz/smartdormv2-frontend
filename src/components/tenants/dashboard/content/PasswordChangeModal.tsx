import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import apiClient from "../../../../services/api";
import { useNotification } from "../../../../context/NotificationContext";

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ open, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const isFormValid = oldPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post("/api/auth/password-change/", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.data.success) {
        showNotification(response.data.message, "success");
        handleClose();
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Ein Fehler ist aufgetreten.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Passwort ändern</DialogTitle>
      <DialogContent>
        <TextField
          label="Aktuelles Passwort"
          type="password"
          fullWidth
          margin="dense"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          disabled={isSubmitting}
        />
        <TextField
          label="Neues Passwort"
          type="password"
          fullWidth
          margin="dense"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isSubmitting}
          helperText="Mindestens 8 Zeichen"
        />
        <TextField
          label="Neues Passwort wiederholen"
          type="password"
          fullWidth
          margin="dense"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isSubmitting}
          error={confirmPassword && newPassword !== confirmPassword}
          helperText={confirmPassword && newPassword !== confirmPassword ? "Passwörter stimmen nicht überein" : ""}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Abbrechen
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid}
          variant="contained"
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Passwort ändern"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeModal;

