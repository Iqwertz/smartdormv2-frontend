import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemText,
  IconButton,
  ListItemButton, // Added for clickable list items
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import CloseIcon from "@mui/icons-material/Close";
import apiClient from "../../../../services/api";
import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
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

// --- Component's internal event structure ---
interface CalendarEvent {
  uid: string;
  summary: string;
  start: Dayjs;
  end: Dayjs;
  location?: string;
  description?: string;
  isAllDay: boolean;
}

// --- Custom Day component to show a badge for events ---
interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
  hasEvents?: boolean;
}

const CustomDay = React.memo((props: CustomPickerDayProps) => {
  const { day, outsideCurrentMonth, hasEvents, ...other } = props;

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      variant="dot"
      color="primary"
      invisible={!hasEvents || outsideCurrentMonth}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
});

// --- Main Calendar Widget Component ---
const CalendarWidget: React.FC = () => {
  const [viewDate, setViewDate] = useState<Dayjs>(dayjs());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);

  // Fetch events from the new API endpoint when the view month/year changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    // This proxy endpoint on your backend should call the external API
    apiClient
      .get<ApiCalendarEntry[]>("https://rooms.schollheim.net/api/getCalendar", {
        params: {
          year: viewDate.year(),
          month: viewDate.month(), // dayjs month is 0-indexed
        },
      })
      .then((response) => {
        const parsedEvents: CalendarEvent[] = response.data.map((entry) => {
          const start = dayjs(entry.time[0]);
          const end = dayjs(entry.time[1]);

          // Simple all-day check: event is 24 hours long and starts at midnight.
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
  }, [viewDate]);

  // Memoize the set of days that have events to optimize rendering
  const eventDays = useMemo(() => {
    const days = new Set<string>();
    events.forEach((event) => {
      let current = event.start.startOf("day");
      // Adjust end date for multi-day events
      const iterationEndDate = event.isAllDay ? event.end.subtract(1, "day").endOf("day") : event.end;

      while (current.isBefore(iterationEndDate) || current.isSame(iterationEndDate, "day")) {
        days.add(current.format("YYYY-MM-DD"));
        current = current.add(1, "day");
      }
    });
    return days;
  }, [events]);

  const handleDayClick = useCallback(
    (day: Dayjs) => {
      const eventsOnDay = events.filter((event) => {
        const targetDayStart = day.startOf("day");
        const targetDayEnd = day.endOf("day");
        // For all-day events, the end time might be midnight of the next day.
        // We subtract a millisecond to ensure it's counted for the correct day.
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

    // Handle events that are a single point in time
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
          day: (dayProps) => <CustomDay {...dayProps} hasEvents={eventDays.has(dayProps.day.format("YYYY-MM-DD"))} />,
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
        <DialogActions>
          <Button onClick={handleCloseDialog}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CalendarWidget;
