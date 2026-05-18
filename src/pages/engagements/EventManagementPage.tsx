import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useNavigate } from "react-router-dom";
import attendanceService, { AttendanceEvent, AttendanceSession } from "../../services/attendanceService";

const EventManagementPage: React.FC = () => {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [sessions, setSessions] = useState<Record<number, AttendanceSession[]>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventData, setNewEventData] = useState({
    name: "",
    parts_count: 1,
    required_parts: 1,
    admin_groups: "ADMIN",
  });
  const navigate = useNavigate();

  const fetchEvents = () => {
    setLoading(true);
    attendanceService
      .getEvents()
      .then((res) => {
        setEvents(res.data);
        res.data.forEach((evt) => {
          attendanceService.getSessions(evt.id).then((sessRes) => {
            setSessions((prev) => ({ ...prev, [evt.id]: sessRes.data }));
          });
        });
      })
      .catch((err) => console.error("Error fetching events", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = () => {
    const payload = {
      ...newEventData,
      admin_groups: newEventData.admin_groups
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g),
    };
    attendanceService
      .createEvent(payload)
      .then(() => {
        setIsDialogOpen(false);
        fetchEvents();
      })
      .catch(console.error);
  };

  const handleCreateSession = (eventId: number) => {
    const event = events.find((candidate) => candidate.id === eventId);
    const defaultTitle = event ? `${event.name} - ${new Date().toLocaleDateString()}` : "Neue Session";
    const title = window.prompt("Session-Titel", defaultTitle);
    if (title === null) return;

    attendanceService
      .createSession(eventId, title.trim())
      .then(() => fetchEvents())
      .catch(console.error);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Event Dashboard</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsDialogOpen(true)}>
          Neues Event
        </Button>
      </Box>

      {events.map((evt) => (
        <Paper key={evt.id} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6">
            {evt.name} (Parts: {evt.parts_count}, Required: {evt.required_parts})
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Admins: {evt.admin_groups.join(", ")}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 1 }}>
            <Button variant="outlined" size="small" onClick={() => handleCreateSession(evt.id)}>
              + Neue Session starten
            </Button>
          </Box>

          <List>
            {sessions[evt.id]?.map((session) => (
              <ListItem key={session.id} divider>
                <ListItemText
                  primary={session.title || `Session ${session.id}`}
                  secondary={`Datum: ${new Date(session.date).toLocaleDateString()} · Status: ${session.status} · Aktueller Part: ${session.current_part} / ${evt.parts_count}`}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  {session.status === "CREATED" && (
                    <Button
                      size="small"
                      color="primary"
                      variant="contained"
                      onClick={() => navigate(`/attendance/display/${session.id}`)}
                    >
                      Display Starten
                    </Button>
                  )}
                  {session.status === "ACTIVE" && (
                    <Button
                      size="small"
                      color="warning"
                      variant="contained"
                      onClick={() => navigate(`/attendance/display/${session.id}`)}
                    >
                      Zum Display
                    </Button>
                  )}
                  <Button
                    size="small"
                    color="info"
                    onClick={() => navigate(`/attendance/report/${session.id}`)}
                    startIcon={<BarChartIcon />}
                  >
                    Report
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Neues Event</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={newEventData.name}
            onChange={(e) => setNewEventData({ ...newEventData, name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Parts Count"
            type="number"
            value={newEventData.parts_count}
            onChange={(e) => setNewEventData({ ...newEventData, parts_count: parseInt(e.target.value) || 1 })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Required Parts"
            type="number"
            value={newEventData.required_parts}
            onChange={(e) => setNewEventData({ ...newEventData, required_parts: parseInt(e.target.value) || 1 })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Admin Groups (kommagetrennt)"
            value={newEventData.admin_groups}
            onChange={(e) => setNewEventData({ ...newEventData, admin_groups: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCreateEvent}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManagementPage;
