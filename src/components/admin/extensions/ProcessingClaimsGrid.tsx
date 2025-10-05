import React, { useState, useEffect, useCallback } from "react";
import { Box, Alert, CircularProgress, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Claim } from "../../../types/tenant";
import { fetchClaimsByStatus, processClaimDecision } from "../../../services/claimService";
import { useNotification } from "../../../context/NotificationContext";
import { Dayjs } from "dayjs";

const ProcessingClaimsGrid: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decisionStates, setDecisionStates] = useState<Record<number, { newDate: Dayjs | null; isDeciding: boolean }>>(
    {}
  );
  const { showNotification } = useNotification();

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClaimsByStatus("PROCESSING");
      setClaims(data);
    } catch (err) {
      setError("Anträge in Bearbeitung konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleDateChange = (id: number, newDate: Dayjs | null) => {
    setDecisionStates((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), newDate } }));
  };

  const handleDecision = async (id: number, decision: "APPROVED" | "REJECTED") => {
    setDecisionStates((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), isDeciding: true } }));
    const { newDate } = decisionStates[id] || {};

    try {
      await processClaimDecision(id, decision, newDate ? newDate.format("YYYY-MM-DD") : undefined);
      showNotification(`Antrag erfolgreich ${decision === "APPROVED" ? "genehmigt" : "abgelehnt"}.`, "success");
      loadClaims();
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Entscheidung fehlgeschlagen.", "error");
    } finally {
      setDecisionStates((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), isDeciding: false } }));
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (claims.length === 0) return <Typography>Keine Anträge in Bearbeitung.</Typography>;

  return (
    <Grid container spacing={2}>
      {claims.map((claim) => {
        const isDeciding = decisionStates[claim.id]?.isDeciding || false;
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={claim.id}>
            <Card variant="outlined">
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6">
                  {claim.tenant.name} {claim.tenant.surname}
                </Typography>
                <Typography color="text.secondary">Zimmer: {claim.tenant.current_room}</Typography>
                <DatePicker
                  label="Neues Auszugsdatum (optional)"
                  value={decisionStates[claim.id]?.newDate || null}
                  onChange={(d) => handleDateChange(claim.id, d)}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  disabled={isDeciding}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDecision(claim.id, "REJECTED")}
                    disabled={isDeciding}
                    fullWidth
                  >
                    Ablehnen
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleDecision(claim.id, "APPROVED")}
                    disabled={isDeciding}
                    fullWidth
                  >
                    Genehmigen
                  </Button>
                </Box>
                {isDeciding && <CircularProgress size={24} sx={{ alignSelf: "center" }} />}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ProcessingClaimsGrid;
