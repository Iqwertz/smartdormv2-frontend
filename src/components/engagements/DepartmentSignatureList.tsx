import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import apiClient from "../../services/api";
import { DepartmentSignature } from "../../types/tenant";
import { useNotification } from "../../context/NotificationContext";

interface DepartmentSignatureListProps {
  departmentSlug: string;
  signed: boolean;
}

/**
 * Renders a list of department signatures, either signed or unsigned.
 * Handles fetching data and submitting updates for each signature.
 */
const DepartmentSignatureList: React.FC<DepartmentSignatureListProps> = ({ departmentSlug, signed }) => {
  const [signatures, setSignatures] = useState<DepartmentSignature[]>([]);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const { showNotification } = useNotification();

  const fetchSignatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/department/signatures/${departmentSlug}/list/`, {
        params: { signed },
      });
      setSignatures(response.data);
      const initialAmounts: Record<number, string> = {};
      response.data.forEach((sig: DepartmentSignature) => {
        initialAmounts[sig.id] = sig.amount?.toString() || "0";
      });
      setAmounts(initialAmounts);
    } catch (err) {
      setError("Signaturen konnten nicht geladen werden.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [departmentSlug, signed]);

  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  const handleAmountChange = (id: number, value: string) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (id: number) => {
    setSubmittingId(id);
    const amount = amounts[id];
    if (isNaN(parseFloat(amount))) {
      showNotification("Bitte einen gültigen Betrag eingeben.", "error");
      setSubmittingId(null);
      return;
    }
    try {
      await apiClient.put(`/api/department/signatures/${id}/update/`, { amount });
      showNotification("Signatur erfolgreich gespeichert.", "success");
      fetchSignatures();
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Speichern fehlgeschlagen.", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  if (signatures.length === 0) {
    return (
      <Typography sx={{ p: 2, textAlign: "center" }} color="text.secondary">
        Keine Einträge gefunden.
      </Typography>
    );
  }

  return (
    <List>
      {signatures.map((sig) => {
        const isClosed = sig.departure.status === "CLOSED";
        return (
          <ListItem
            key={sig.id}
            divider
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}
          >
            <ListItemText primary={sig.departure.tenant_name} secondary={`Status: ${sig.departure.status}`} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                label="Betrag (€)"
                type="number"
                size="small"
                value={amounts[sig.id] ?? "0"}
                onChange={(e) => handleAmountChange(sig.id, e.target.value)}
                disabled={submittingId === sig.id || isClosed}
                InputProps={{
                  inputProps: {
                    step: "0.01",
                    min: 0,
                  },
                }}
                sx={{ width: "120px" }}
              />
              <Button
                variant="contained"
                onClick={() => handleSubmit(sig.id)}
                disabled={submittingId === sig.id || isClosed}
                sx={{ minWidth: "180px" }}
              >
                {submittingId === sig.id ? (
                  <CircularProgress size={24} />
                ) : signed ? (
                  "Betrag aktualisieren"
                ) : (
                  "Auszug unterschreiben"
                )}
              </Button>
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
};

export default DepartmentSignatureList;
