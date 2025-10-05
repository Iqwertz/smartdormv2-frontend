// src/components/tenants/dashboard/content/CalendarWidget.tsx
/*
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Link,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import CloseIcon from "@mui/icons-material/Close";
import LaunchIcon from "@mui/icons-material/Launch";
import apiClient from "../../../../services/api";
import ICAL from "ical.js";
import dayjs, { Dayjs } from "dayjs"; // Import dayjs

// Ensure dayjs plugins are available if needed (e.g., for formatting)
import localizedFormat from "dayjs/plugin/localizedFormat";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);

interface CalendarEvent {
  uid: string; // Unique ID for key prop
  summary: string;
  start: Dayjs; // Use Dayjs objects
  end: Dayjs; // Use Dayjs objects
  location?: string;
  description?: string;
  isAllDay: boolean;
}

interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
  hasEvents?: boolean;
}

// Custom Day component to show badge
const CustomDay = React.memo((props: CustomPickerDayProps) => {
  const { day, outsideCurrentMonth, hasEvents, ...other } = props;

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      color="primary"
      variant="dot"
      invisible={!hasEvents || outsideCurrentMonth} // Hide badge if no events or outside month
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
});

const CalendarWidget: React.FC = () => {
  const [value, setValue] = useState<Dayjs | null>(dayjs()); // Selected value in calendar
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendarUrl, setcalendarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);

  // Fetch and Parse ICS Data
  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<{ icsData: string; icsUrl: string; calendarUrl: string }>("api/tenants/calendar-proxy")
      .then((response) => {
        setcalendarUrl(response.data.calendarUrl); // Store the URL
        try {
          const jcalData = ICAL.parse(response.data.icsData); // Parse the ICS data string
          const comp = new ICAL.Component(jcalData);
          const vevents = comp.getAllSubcomponents("vevent");
          const parsedEvents: CalendarEvent[] = [];

          vevents.forEach((vevent: any) => {
            const event = new ICAL.Event(vevent);
            const startDate = dayjs(event.startDate.toJSDate());
            const endDate = dayjs(event.endDate.toJSDate());

            let isAllDay = false;
            const duration = event.duration.toSeconds();
            if (duration > 0 && duration % (24 * 60 * 60) === 0) {
              isAllDay = true;
            } else if (event.endDate.isDate && !endDate.isSame(startDate, "day")) {
              // Check if end is midnight
              isAllDay = endDate.hour() === 0 && endDate.minute() === 0 && endDate.second() === 0;
            }

            parsedEvents.push({
              uid: event.uid || `${event.summary}-${startDate.toISOString()}`,
              summary: event.summary || "Kein Titel",
              start: startDate,
              end: endDate,
              location: event.location || undefined,
              description: event.description || undefined,
              isAllDay: isAllDay,
            });
          });

          setEvents(parsedEvents);
        } catch (parseError) {
          console.error("Failed to parse ICS data:", parseError);
          setError("Kalenderdaten konnten nicht verarbeitet werden.");
          setEvents([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch calendar data:", err);
        setError(err.response?.data?.error || "Kalenderdaten konnten nicht geladen werden.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const eventDays = useMemo(() => {
    const days = new Set<string>();
    events.forEach((event) => {
      let current = event.start.startOf("day");
      const iterationEndDate =
        event.isAllDay && event.end.isSame(event.end.startOf("day"))
          ? event.end.subtract(1, "day").endOf("day")
          : event.end;

      while (current.isBefore(iterationEndDate, "day") || current.isSame(iterationEndDate, "day")) {
        days.add(current.format("YYYY-MM-DD"));
        current = current.add(1, "day");
      }
    });
    return days;
  }, [events]);

  const handleMonthChange = (date: Dayjs) => {
    console.log("Month changed to:", date.format("YYYY-MM"));
  };

  const handleDayClick = (day: Dayjs) => {
    setValue(day);

    const eventsOnDay = events.filter((event) => {
      const targetDayStart = day.startOf("day");
      const targetDayEnd = day.endOf("day");
      const eventStart = event.start;
      const eventEnd = event.end;

      const effectiveEventEnd =
        event.isAllDay && eventEnd.isSame(eventEnd.startOf("day")) && !eventEnd.isSame(eventStart, "day")
          ? eventEnd.subtract(1, "millisecond")
          : eventEnd;

      return eventStart.isBefore(targetDayEnd) && effectiveEventEnd.isAfter(targetDayStart);
    });

    setSelectedDate(day);
    setSelectedDayEvents(eventsOnDay);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  const formatEventTime = (event: CalendarEvent): string => {
    if (event.isAllDay) return "Ganztägig";
    const start = event.start.format("HH:mm");

    const end =
      event.end.isSame(event.start) || event.end.isSame(event.start.add(1, "day").startOf("day"))
        ? ""
        : ` - ${event.end.format("HH:mm")}`;
    return `${start}${end}`;
  };

  const cardAction = calendarUrl ? (
    <Button
      size="small"
      color="primary"
      href={calendarUrl}
      target="_blank"
      rel="noopener noreferrer"
      endIcon={<LaunchIcon />}
    >
      Kalender öffnen
    </Button>
  ) : null;

  return (
    <>
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress />
        </Box>
      )}
      {error && !loading && (
        <Box p={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      {!loading && !error && (
        <DateCalendar
          value={value}
          onChange={handleDayClick} // Use our handler to open dialog
          onMonthChange={handleMonthChange}
          loading={loading}
          // Render custom day component with badge
          slots={{
            day: (dayProps) => <CustomDay {...dayProps} hasEvents={eventDays.has(dayProps.day.format("YYYY-MM-DD"))} />,
          }}
          sx={{
            width: "100%",
            maxHeight: "450px",
          }}
        />
      )}
      <Dialog onClose={handleCloseDialog} open={isDialogOpen} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Termine am {selectedDate?.format("LL")}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDayEvents.length > 0 ? (
            <List dense>
              {selectedDayEvents.map((event) => (
                <ListItem key={event.uid} disablePadding>
                  <Tooltip title={event.description || ""} arrow placement="top-start">
                    <ListItemText
                      primary={event.summary}
                      secondary={`${formatEventTime(event)}${event.location ? ` - ${event.location}` : ""}`}
                    />
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Keine Termine für diesen Tag.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", padding: "8px 24px" }}>
          {calendarUrl && (
            <Link href={calendarUrl} target="_blank" rel="noopener noreferrer" variant="body2">
              Kalendar
            </Link>
          )}
          <Button onClick={handleCloseDialog}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CalendarWidget;
*/
