import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Departure } from "../../../types/tenant";
import { fetchDeparturesByStatus, closeDeparture } from "../../../services/departureService";
import { useNotification } from "../../../context/NotificationContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import dayjs, { Dayjs } from "dayjs";

const ConfirmedDeparturesList: React.FC = () => {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closingStates, setClosingStates] = useState<Record<number, { newDate: Dayjs | null; isClosing: boolean }>>({});
  const { showNotification } = useNotification();

  const loadDepartures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeparturesByStatus("CONFIRMED");
    } catch (err) {
      setError("Bestätigte Auszüge konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartures();
  }, [loadDepartures]);

  const handleDateChange = (id: number, newDate: Dayjs | null) => {
    setClosingStates((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), newDate } }));
  };

  const handleCloseDeparture = async (id: number) => {
    setClosingStates((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), isClosing: true } }));
    const { newDate } = closingStates[id] || {};
    try {
      await closeDeparture(id, newDate ? newDate.format("YYYY-MM-DD") : undefined);
      showNotification("Auszug erfolgreich abgeschlossen.", "success");
      loadDepartures();
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Abschließen fehlgeschlagen.", "error");
    } finally {
      setClosingStates((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), isClosing: false } }));
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (departures.length === 0) return <Typography>Keine bestätigten Auszüge gefunden.</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {departures.map((dep) => {
        const allSigned = dep.signatures?.every((sig) => sig.signed_on !== "1900-01-01") ?? false;
        const isClosing = closingStates[dep.tenant.id]?.isClosing || false;

        return (
          <Card key={dep.tenant.id} variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6">
                    {dep.tenant.name} {dep.tenant.surname}
                  </Typography>
                  <Typography color="text.secondary">Zimmer: {dep.tenant.current_room}</Typography>
                  <Typography color="text.secondary">
                    Auszug am: {dayjs(dep.tenant.move_out).format("DD.MM.YYYY")}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Email: {dep.tenant.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Typography variant="subtitle1">Signaturen</Typography>
                  <List dense>
                    {dep.signatures?.map((sig) => (
                      <ListItem key={sig.id} disablePadding>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {sig.signed_on !== "1900-01-01" ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <CancelIcon color="error" fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText primary={sig.department_name} secondary={`Betrag: ${sig.amount} €`} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle1">Aktion</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                    <DatePicker
                      label="Neues Auszugsdatum (optional)"
                      value={closingStates[dep.tenant.id]?.newDate || null}
                      onChange={(d) => handleDateChange(dep.tenant.id, d)}
                      slotProps={{ textField: { size: "small" } }}
                      disabled={isClosing}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleCloseDeparture(dep.tenant.id)}
                      disabled={!allSigned || isClosing}
                    >
                      {isClosing ? <CircularProgress size={24} /> : "Auszug schließen"}
                    </Button>
                    {!allSigned && (
                      <Typography variant="caption" color="error">
                        Es fehlen noch Signaturen.
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default ConfirmedDeparturesList;
