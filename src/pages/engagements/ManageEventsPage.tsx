import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, List, ListItem, ListItemText, Divider, CircularProgress } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BarChartIcon from "@mui/icons-material/BarChart";
import AddIcon from "@mui/icons-material/Add";
import attendanceService, { AttendanceEvent, AttendanceSession } from "../../services/attendanceService";
import DashboardCard from "../../components/shared/DashboardCard";

const ManageEventsPage: React.FC = () => {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [sessions, setSessions] = useState<Record<number, AttendanceSession[]>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvents = () => {
    setLoading(true);
    attendanceService
      .getManageableEvents()
      .then((res) => {
        setEvents(res.data);
        res.data.forEach((evt) => {
          attendanceService.getSessions(evt.id).then((sessRes) => {
            setSessions((prev) => ({ ...prev, [evt.id]: sessRes.data }));
          });
        });
      })
      .catch((err) => console.error("Error fetching manageable events", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateSession = (eventId: number) => {
    attendanceService
      .createSession(eventId)
      .then(() => fetchEvents())
      .catch(console.error);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1600px", margin: "0 auto", mt: 4 }} className="page-root">
      {events.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          Du bist aktuell für keine Events als Admin eingetragen.
        </Typography>
      ) : (
        events.map((evt) => (
          <DashboardCard
            key={evt.id}
            title={evt.name}
            action={
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleCreateSession(evt.id)}
              >
                Neue Session starten
              </Button>
            }
            cardSx={{ mb: 3 }}
          >
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Teile: {evt.parts_count} | Benötigt: {evt.required_parts}
            </Typography>

            {sessions[evt.id] && sessions[evt.id].length > 0 ? (
              <List disablePadding>
                {sessions[evt.id].map((session, idx) => (
                  <React.Fragment key={session.id}>
                    {idx > 0 && <Divider />}
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary={`Datum: ${new Date(session.date).toLocaleDateString()} - Status: ${session.status}`}
                        secondary={`Aktueller Part: ${session.current_part} / ${evt.parts_count}`}
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {session.status === "CREATED" && (
                          <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            onClick={() => navigate(`/attendance/display/${session.id}`)}
                            startIcon={<PlayArrowIcon />}
                          >
                            Display
                          </Button>
                        )}
                        {session.status === "ACTIVE" && (
                          <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            onClick={() => navigate(`/attendance/display/${session.id}`)}
                          >
                            Zum Display
                          </Button>
                        )}
                        <Button
                          size="small"
                          color="secondary"
                          variant="outlined"
                          onClick={() => navigate(`/attendance/report/${session.id}`)}
                          startIcon={<BarChartIcon />}
                        >
                          Report
                        </Button>
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Keine Sessions vorhanden.
              </Typography>
            )}
          </DashboardCard>
        ))
      )}
    </Box>
  );
};

export default ManageEventsPage;
