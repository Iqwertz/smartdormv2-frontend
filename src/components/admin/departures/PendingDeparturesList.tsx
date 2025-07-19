import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { Departure } from "../../../types/tenant";
import { fetchDepartures, closeDeparture } from "../../../services/departureService";
import { useNotification } from "../../../context/NotificationContext";
import dayjs from "dayjs";

const PendingDeparturesList: React.FC = () => {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const loadDepartures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDepartures("PENDING");
      setDepartures(data);
    } catch (err) {
      setError("Laufende Auszüge konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartures();
  }, [loadDepartures]);

  const handleCloseDeparture = async (tenantId: number) => {
    try {
      await closeDeparture(tenantId);
      showNotification("Auszug erfolgreich abgeschlossen.", "success");
      loadDepartures(); // Refresh the list
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Fehler beim Abschließen des Auszugs.", "error");
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (departures.length === 0) return <Alert severity="info">Keine laufenden Auszüge vorhanden.</Alert>;

  return (
    <Box sx={{ width: "100%" }}>
      {departures.map((departure) => (
        <Accordion key={departure.tenant.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ width: "33%", flexShrink: 0 }}>
              {departure.tenant.name} {departure.tenant.surname}
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              Auszug am: {dayjs(departure.tenant.move_out).format("DD.MM.YYYY")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="h6">Freigaben</Typography>
              <List dense>
                {departure.signatures.map((sig) => (
                  <ListItem key={sig.id}>
                    <ListItemText
                      primary={sig.department_name}
                      secondary={
                        sig.signed_on
                          ? `Freigegeben am ${dayjs(sig.signed_on).format("DD.MM.YYYY")} mit Betrag €${sig.amount}`
                          : "Ausstehend"
                      }
                    />
                    {sig.signed_on ? <CheckCircleIcon color="success" /> : <HourglassEmptyIcon color="warning" />}
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleCloseDeparture(departure.tenant.id)}
                  disabled={!departure.is_fully_signed}
                >
                  Auszug abschließen
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default PendingDeparturesList;
