import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { MembershipApplication } from "../../types/membership";
import { applicationPdfUrl, decideApplication, fetchApplications } from "../../services/membershipService";
import { useNotification } from "../../context/NotificationContext";

interface DecisionState {
  joinDate: Dayjs | null;
  note: string;
  isDeciding: boolean;
}

interface OpenApplicationsGridProps {
  /** Bumped by the parent so the members tab reloads after a decision. */
  onDecided?: () => void;
}

/**
 * Open Beitrittsanträge with approve/deny.
 *
 * Any of Zimmerreferat, Finanzenreferat or Heimrat may decide, so there is no assignment
 * step - the first to act decides, and the backend rejects a second decision.
 */
const OpenApplicationsGrid: React.FC<OpenApplicationsGridProps> = ({ onDecided }) => {
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<number, DecisionState>>({});
  const { showNotification } = useNotification();

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplications("OPEN");
      setApplications(data);
      setDecisions(
        Object.fromEntries(
          data.map((a) => [a.id, { joinDate: dayjs(a.requested_join_date), note: "", isDeciding: false }])
        )
      );
    } catch {
      setError("Die offenen Mitgliedsanträge konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const patch = (id: number, changes: Partial<DecisionState>) =>
    setDecisions((prev) => ({ ...prev, [id]: { ...prev[id], ...changes } }));

  const handleDecision = async (application: MembershipApplication, decision: "APPROVED" | "REJECTED") => {
    const state = decisions[application.id];
    patch(application.id, { isDeciding: true });
    try {
      const response = await decideApplication(application.id, decision, {
        joinDate: decision === "APPROVED" && state?.joinDate ? state.joinDate.format("YYYY-MM-DD") : undefined,
        note: state?.note || undefined,
      });
      showNotification(
        response.mandate_reference
          ? `${response.message} Mandatsreferenz: ${response.mandate_reference}`
          : response.message,
        "success"
      );
      loadApplications();
      onDecided?.();
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Entscheidung fehlgeschlagen.", "error");
      patch(application.id, { isDeciding: false });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  if (applications.length === 0) {
    return <Alert severity="info">Es liegen derzeit keine offenen Mitgliedsanträge vor.</Alert>;
  }

  return (
    <Grid container spacing={2}>
      {applications.map((application) => {
        const state = decisions[application.id] || { joinDate: null, note: "", isDeciding: false };
        return (
          <Grid size={{ xs: 12, md: 6 }} key={application.id}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {application.first_name} {application.last_name}
                  </Typography>
                  <Chip
                    size="small"
                    label={application.payment_method === "SEPA" ? "SEPA-Mandat" : "Andere Zahlungsart"}
                    color={application.payment_method === "SEPA" ? "primary" : "default"}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Zimmer {application.tenant.current_room || "-"} · eingereicht am{" "}
                  {dayjs(application.submitted_at).format("DD.MM.YYYY")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gewünschtes Beitrittsdatum: {dayjs(application.requested_join_date).format("DD.MM.YYYY")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Einwilligung Amtsliste: {application.amtsliste_consent ? "ja" : "nein"}
                </Typography>
                {application.payment_method === "SEPA" && (
                  <Typography variant="body2" color="text.secondary">
                    Kontoinhaber:in: {application.account_holder} · IBAN {application.iban_masked}
                  </Typography>
                )}
                {application.has_pdf && (
                  <MuiLink
                    href={applicationPdfUrl(application.id)}
                    target="_blank"
                    rel="noopener"
                    variant="body2"
                    sx={{ display: "inline-block", mt: 1 }}
                  >
                    Beitrittserklärung als PDF ansehen
                  </MuiLink>
                )}

                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                  <DatePicker
                    label="Beitrittsdatum"
                    value={state.joinDate}
                    onChange={(value) => patch(application.id, { joinDate: value })}
                    format="DD.MM.YYYY"
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                  <TextField
                    label="Notiz (optional, erscheint bei Ablehnung in der E-Mail)"
                    size="small"
                    fullWidth
                    value={state.note}
                    onChange={(e) => patch(application.id, { note: e.target.value })}
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      color="error"
                      variant="outlined"
                      disabled={state.isDeciding}
                      onClick={() => handleDecision(application, "REJECTED")}
                    >
                      Ablehnen
                    </Button>
                    <Button
                      color="success"
                      variant="contained"
                      disabled={state.isDeciding}
                      onClick={() => handleDecision(application, "APPROVED")}
                    >
                      {state.isDeciding ? <CircularProgress size={22} /> : "Genehmigen"}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default OpenApplicationsGrid;
