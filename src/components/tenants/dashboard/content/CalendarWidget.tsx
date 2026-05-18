import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Alert,
  // Badge is no longer needed for the CustomDay component
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemText,
  IconButton,
  ListItemButton,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import CloseIcon from "@mui/icons-material/Close";
import apiClient from "../../../../services/api";
import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useAuth } from "../../../../context/AuthContext";
dayjs.extend(localizedFormat);

// --- Interfaces for the new API response ---
interface ApiReservation {
  name: string;
  roomNumber?: string;
  userId: string;
  email: string;
  description?: string;
  time: [string, string]; // ISO date strings
  id?: number;
  color?: string;
}

interface ApiCalendarEntry extends ApiReservation {
  id: number;
  location?: string;
  calendarId: string;
  title: string;
  emoji: string;
}

// --- Component's internal event structure (MODIFIED) ---
// We now store calendarId and color to use them later.
interface CalendarEvent {
  uid: string;
  summary: string;
  start: Dayjs;
  end: Dayjs;
  location?: string;
  description?: string;
  isAllDay: boolean;
  calendarId: string; // Added
  color?: string; // Added
}

// --- Information about a calendar to be rendered as a dot ---
interface CalendarDotInfo {
  id: string;
  color: string;
}

// --- Custom Day component props (MODIFIED) ---
interface CustomPickerDayProps extends PickersDayProps {
  // Instead of a boolean, we now pass an array of calendar info objects
  calendars?: CalendarDotInfo[];
}

// --- Custom Day component to show multiple colored dots (MODIFIED) ---
const CustomDay = React.memo((props: CustomPickerDayProps) => {
  const { calendars, ...other } = props;

  // We wrap the PickersDay in a Box with relative positioning
  // to absolutely position the dots container at the bottom.
  return (
    <Box sx={{ position: "relative" }}>
      <PickersDay {...other} />
      {calendars && calendars.length > 0 && !props.outsideCurrentMonth && (
        <Box
          sx={{
            position: "absolute",
            bottom: 4,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: "3px", // Space between dots
          }}
        >
          {calendars.map((cal) => (
            <Box
              key={cal.id}
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: cal.color || "grey", // Fallback color
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
});

// --- Main Calendar Widget Component ---
const CalendarWidget: React.FC = () => {
  const [viewDate, setViewDate] = useState<Dayjs>(dayjs());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    apiClient
      .get<ApiCalendarEntry[]>("https://api-rooms.schollheim.net/api/getCalendar", {
        params: {
          year: viewDate.year(),
          month: viewDate.month(),
          roles: authState.user?.groups || [],
        },
      })
      .then((response) => {
        // MODIFIED: Capture calendarId and color during parsing
        const parsedEvents: CalendarEvent[] = response.data.map((entry) => {
          const start = dayjs(entry.time[0]);
          const end = dayjs(entry.time[1]);
          const isAllDay =
            start.hour() === 0 && start.minute() === 0 && start.second() === 0 && end.diff(start, "hour") >= 24;

          return {
            uid: entry.id.toString(),
            summary: `${entry.emoji} ${entry.title}`,
            start,
            end,
            location: entry.location || entry.roomNumber,
            description: entry.description,
            isAllDay,
            calendarId: entry.calendarId,
            color: entry.color,
          };
        });
        setEvents(parsedEvents);
      })
      .catch((err) => {
        console.error("Failed to fetch calendar data:", err);
        setError(err.response?.data?.error || "Kalenderdaten konnten nicht geladen werden.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [viewDate, authState.user?.groups]);
  const eventsByDay = useMemo(() => {
    const dayMap = new Map<string, CalendarDotInfo[]>();

    events.forEach((event) => {
      let current = event.start.startOf("day");
      const iterationEndDate = event.isAllDay ? event.end.subtract(1, "day").endOf("day") : event.end;

      while (current.isBefore(iterationEndDate) || current.isSame(iterationEndDate, "day")) {
        const dayKey = current.format("YYYY-MM-DD");

        // Get or initialize the array for this day
        if (!dayMap.has(dayKey)) {
          dayMap.set(dayKey, []);
        }
        const calendarsForDay = dayMap.get(dayKey)!;

        // Add the calendar info for this event ONLY if it's not already there for this day
        const calendarExists = calendarsForDay.some((c) => c.id === event.calendarId);
        if (!calendarExists && event.color) {
          // Only add if it has a color
          calendarsForDay.push({ id: event.calendarId, color: event.color });
        }

        current = current.add(1, "day");
      }
    });

    return dayMap;
  }, [events]);

  const handleDayClick = useCallback(
    (day: Dayjs | null) => {
      if (!day) return;

      const eventsOnDay = events.filter((event) => {
        const targetDayStart = day.startOf("day");
        const targetDayEnd = day.endOf("day");
        const effectiveEventEnd =
          event.isAllDay && event.end.isSame(event.end.startOf("day")) && !event.end.isSame(event.start, "day")
            ? event.end.subtract(1, "millisecond")
            : event.end;
        return event.start.isBefore(targetDayEnd) && effectiveEventEnd.isAfter(targetDayStart);
      });

      setSelectedDate(day);
      setSelectedDayEvents(eventsOnDay);
      setIsDialogOpen(true);
    },
    [events]
  );
  const handleCloseDialog = () => setIsDialogOpen(false);

  const formatEventTime = (event: CalendarEvent): string => {
    if (event.isAllDay) return "Ganztägig";

    const start = event.start;
    const end = event.end;

    if (end.isSame(start)) {
      return start.format("HH:mm");
    }

    let formattedString = "";
    const isMultiDay = !start.isSame(end, "day");

    if (isMultiDay) {
      formattedString += start.format("DD.MM ");
    }
    formattedString += start.format("HH:mm");
    formattedString += " - ";

    if (isMultiDay) {
      formattedString += end.format("DD.MM ");
    }
    formattedString += end.format("HH:mm");

    return formattedString;
  };

  return (
    <>
      <DateCalendar
        onMonthChange={(date) => setViewDate(date)}
        onChange={handleDayClick}
        loading={loading}
        slots={{
          // MODIFIED: Pass the array of unique calendars for the day to CustomDay
          day: (dayProps) => {
            const dayKey = dayProps.day.format("YYYY-MM-DD");
            return <CustomDay {...dayProps} calendars={eventsByDay.get(dayKey)} />;
          },
        }}
        slotProps={{
          calendarHeader: {
            disabled: loading,
          },
        }}
        sx={{
          width: "100%",
        }}
      />
      {error && !loading && (
        <Box px={2} pb={1}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Dialog onClose={handleCloseDialog} open={isDialogOpen} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Termine am {selectedDate?.format("LL")}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedDayEvents.length > 0 ? (
            <List dense sx={{ py: 0 }}>
              {selectedDayEvents.map((event) => (
                <ListItemButton
                  key={event.uid}
                  component="a"
                  href="https://rooms.schollheim.net/#/calendar"
                  target="_blank"
                  rel="noopener noreferrer"
                  divider
                >
                  <ListItemText
                    primary={event.summary}
                    secondary={`${formatEventTime(event)}${event.location ? ` - ${event.location}` : ""}`}
                  />
                </ListItemButton>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              Keine Termine für diesen Tag.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button href="https://rooms.schollheim.net/#/calendar" target="_blank" rel="noopener noreferrer">
            Termin eintragen
          </Button>
          <Button onClick={handleCloseDialog}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CalendarWidget;
