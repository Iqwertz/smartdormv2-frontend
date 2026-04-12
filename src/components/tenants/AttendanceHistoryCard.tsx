import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardCard from "../shared/DashboardCard";
import attendanceService, { AttendanceRecord } from "../../services/attendanceService";

interface AttendanceHistoryCardProps {
  refreshTrigger?: number;
}

type SessionSummary = {
  sessionId: number;
  eventName: string;
  sessionDate: string;
  partsAttended: number;
  maxParts: number;
  requiredParts: number;
};

type EventTypeGroup = {
  eventName: string;
  sessions: SessionSummary[];
  fullyAttendedCount: number;
};

const AttendanceHistoryCard: React.FC<AttendanceHistoryCardProps> = ({ refreshTrigger = 0 }) => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    attendanceService
      .getMyHistory()
      .then((res) => setHistory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const groupedHistory = useMemo<EventTypeGroup[]>(() => {
    const grouped = new Map<number, SessionSummary & { attendedParts: Set<number> }>();

    history.forEach((record) => {
      if (!grouped.has(record.session)) {
        grouped.set(record.session, {
          sessionId: record.session,
          eventName: record.event_name || "Veranstaltung",
          sessionDate: record.session_date || record.timestamp,
          maxParts: record.event_parts_count || 0,
          requiredParts: record.event_required_parts || 0,
          partsAttended: 0,
          attendedParts: new Set<number>(),
        });
      }

      const entry = grouped.get(record.session);
      if (!entry) return;

      entry.attendedParts.add(record.part);
      entry.partsAttended = entry.attendedParts.size;
    });

    const sessionSummaries = Array.from(grouped.values())
      .map(({ attendedParts, ...entry }) => entry)
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

    const byEventName = new Map<string, SessionSummary[]>();
    sessionSummaries.forEach((session) => {
      const key = session.eventName;
      if (!byEventName.has(key)) {
        byEventName.set(key, []);
      }
      byEventName.get(key)?.push(session);
    });

    return Array.from(byEventName.entries())
      .map(([eventName, sessions]) => ({
        eventName,
        sessions,
        fullyAttendedCount: sessions.filter((session) => session.partsAttended >= session.requiredParts).length,
      }))
      .sort((a, b) => a.eventName.localeCompare(b.eventName));
  }, [history]);

  return (
    <DashboardCard title="Anwesenheitshistorie" contentSx={{ p: "8px 16px" }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : groupedHistory.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Keine Anwesenheiten protokolliert.
        </Typography>
      ) : (
        <Box sx={{ mt: 0.5 }}>
          {groupedHistory.map((eventGroup) => (
            <Accordion key={eventGroup.eventName} disableGutters elevation={0} sx={{ backgroundColor: "transparent" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 40 }}>
                <Box
                  sx={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", pr: 1 }}
                >
                  <Typography variant="subtitle1">{eventGroup.eventName}</Typography>
                  <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
                    Gesamt: {eventGroup.fullyAttendedCount}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0 }}>
                <List dense sx={{ py: 0 }}>
                  {eventGroup.sessions.map((session) => (
                    <ListItem key={session.sessionId} divider sx={{ px: 0 }}>
                      <ListItemText secondary={new Date(session.sessionDate).toLocaleDateString()} />
                      <Typography sx={{ color: "primary.main", fontWeight: 700 }}>
                        {session.partsAttended}/{session.maxParts || "?"}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </DashboardCard>
  );
};

export default AttendanceHistoryCard;
