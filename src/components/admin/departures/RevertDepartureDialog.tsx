import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { TenantProfile } from "../../../types/tenant";
import { revertDeparture } from "../../../services/departureService";
import { useNotification } from "../../../context/NotificationContext";

interface RevertDepartureDialogProps {
  // The tenant whose departure is reverted; null keeps the dialog closed
  tenant: TenantProfile | null;
  onClose: () => void;
  onDone: () => void;
}

const RevertDepartureDialog: React.FC<RevertDepartureDialogProps> = ({ tenant, onClose, onDone }) => {
  const [isReverting, setIsReverting] = useState(false);
  const { showNotification } = useNotification();

  const handleRevert = async () => {
    if (!tenant) return;
    setIsReverting(true);
    try {
      const response = await revertDeparture(tenant.id);
      showNotification(response.message, "success");
      onClose();
      onDone();
    } catch (err: unknown) {
      const apiError = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      showNotification(apiError || "Zurückziehen hat nicht geklappt. Versuch's nochmal.", "error");
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <Dialog open={tenant !== null} onClose={isReverting ? undefined : onClose}>
      <DialogTitle>Auszug zurückziehen?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Unterschriften, Bankdaten und ein offener Verlängerungsantrag werden gelöscht. Unter „Auszugskandidaten“
          kannst du den Auszug neu anlegen, dann entscheidet {tenant?.name} nochmal.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isReverting}>
          Abbrechen
        </Button>
        <Button onClick={handleRevert} color="error" variant="contained" disabled={isReverting}>
          {isReverting ? <CircularProgress size={24} /> : "Zurückziehen"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RevertDepartureDialog;
