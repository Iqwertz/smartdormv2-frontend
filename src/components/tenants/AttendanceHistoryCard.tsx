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
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardCard from "../shared/DashboardCard";
import attendanceService, { AttendanceRecord } from "../../services/attendanceService";

interface AttendanceHistoryCardProps {
  refreshTrigger?: number;
}

type SessionSummary = {
  sessionId: number | null;
  eventName: string;
  sessionTitle: string | null;
  sessionDate: string | null;
  partsAttended: number;
  maxParts: number;
  requiredParts: number;
  isBaseAttendance: boolean;
  baseAttendanceSessionsCount?: number;
  baseAttendanceNote?: string | null;
};

type EventTypeGroup = {
  eventName: string;
  sessions: SessionSummary[];
  baseAttendance: SessionSummary | null;
  fullyAttendedCount: number;
};

const AttendanceHistoryCard: React.FC<AttendanceHistoryCardProps> = ({ refreshTrigger = 0 }) => {
  const [history, setHistory] = useState<
    (AttendanceRecord & {
      is_base_attendance?: boolean;
      base_attendance_note?: string | null;
      base_attendance_sessions_count?: number;
    })[]
  >([]);
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
    const sessionMap = new Map<number, SessionSummary & { attendedParts: Set<number> }>();
    const baseAttendanceByEvent = new Map<string, SessionSummary>();

    history.forEach((record) => {
      if (record.is_base_attendance) {
        // Handle base attendance records - single entry per event
        const eventName = record.event_name || "Veranstaltung";
        const key = eventName;

        if (!baseAttendanceByEvent.has(key)) {
          const summary: SessionSummary = {
            sessionId: null,
            eventName: eventName,
            sessionTitle: "Anwesenheit aus altem System",
            sessionDate: null,
            partsAttended: record.base_attendance_sessions_count || 0,
            maxParts: record.base_attendance_sessions_count || 0,
            requiredParts: record.event_required_parts || 0,
            isBaseAttendance: true,
            baseAttendanceSessionsCount: record.base_attendance_sessions_count,
            baseAttendanceNote: record.base_attendance_note,
          };
          baseAttendanceByEvent.set(key, summary);
        }
      } else {
        // Handle regular attendance records
        if (!sessionMap.has(record.session)) {
          sessionMap.set(record.session, {
            sessionId: record.session,
            eventName: record.event_name || "Veranstaltung",
            sessionTitle: record.session_title || record.event_name || "Session",
            sessionDate: record.session_date || record.timestamp,
            maxParts: record.event_parts_count || 0,
            requiredParts: record.event_required_parts || 0,
            partsAttended: 0,
            isBaseAttendance: false,
            attendedParts: new Set<number>(),
          });
        }

        const entry = sessionMap.get(record.session);
        if (!entry) return;

        entry.attendedParts.add(record.part);
        entry.partsAttended = entry.attendedParts.size;
      }
    });

    const sessionSummaries = Array.from(sessionMap.values())
      .map((entry) => {
        const { attendedParts, ...summary } = entry;
        void attendedParts;
        return summary;
      })
      .sort((a, b) => new Date(b.sessionDate || 0).getTime() - new Date(a.sessionDate || 0).getTime());

    const byEventName = new Map<string, { sessions: SessionSummary[]; baseAttendance: SessionSummary | null }>();
    sessionSummaries.forEach((session) => {
      const key = session.eventName;
      if (!byEventName.has(key)) {
        byEventName.set(key, { sessions: [], baseAttendance: null });
      }
      byEventName.get(key)?.sessions.push(session);
    });

    // Add base attendance to each event
    baseAttendanceByEvent.forEach((baseAttn, eventName) => {
      if (!byEventName.has(eventName)) {
        byEventName.set(eventName, { sessions: [], baseAttendance: baseAttn });
      } else {
        byEventName.get(eventName)!.baseAttendance = baseAttn;
      }
    });

    return Array.from(byEventName.entries())
      .map(([eventName, { sessions, baseAttendance }]) => {
        // Calculate fully attended count: fully attended new sessions + base attendance sessions
        const fullyAttendedNewSessions = sessions.filter((s) => s.partsAttended >= s.requiredParts).length;
        const fullyAttendedCount = fullyAttendedNewSessions + (baseAttendance?.baseAttendanceSessionsCount || 0);

        return {
          eventName,
          sessions,
          baseAttendance,
          fullyAttendedCount,
        };
      })
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
                  {/* Regular sessions */}
                  {eventGroup.sessions.map((session) => (
                    <ListItem key={session.sessionId} divider sx={{ px: 0 }}>
                      <ListItemText
                        primary={session.sessionTitle}
                        secondary={
                          session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : "Datum unbekannt"
                        }
                      />
                      <Typography sx={{ color: "primary.main", fontWeight: 700 }}>
                        {session.partsAttended}/{session.maxParts || "?"}
                      </Typography>
                    </ListItem>
                  ))}
                  {/* Base attendance section */}
                  {eventGroup.baseAttendance && (
                    <ListItem divider sx={{ px: 0, py: 1, backgroundColor: "#f5f5f5" }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography>{eventGroup.baseAttendance.sessionTitle}</Typography>
                          </Box>
                        }
                      />
                      <Typography sx={{ color: "primary.main", fontWeight: 700 }}>
                        {eventGroup.baseAttendance.baseAttendanceSessionsCount || 0}
                      </Typography>
                    </ListItem>
                  )}
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
