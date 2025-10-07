import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  Link,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  RoomStatus,
  fetchRoomsStatus,
  WashingMachineSummary,
  fetchWashingMachineStatus,
} from "../../../../services/externalStatusService";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";

/**
 * Determines the color and label for a room's status chip.
 * @param status The current status of the room.
 * @param currentBookings The number of current bookings.
 * @param maxBookings The maximum number of bookings.
 * @returns Properties for the MUI Chip component.
 */
const getStatusChipProps = (status: RoomStatus["status"], currentBookings: number, maxBookings: number) => {
  if (status === "available" && currentBookings >= maxBookings) {
    return { label: "Belegt", color: "warning" as const };
  }
  switch (status) {
    case "available":
      return { label: "Frei", color: "success" as const };
    case "closed":
      return { label: "Geschlossen", color: "error" as const };
    default:
      return { label: status.toUpperCase(), color: "default" as const };
  }
};

/**
 * Renders the compact list of bookable rooms and their status.
 */
const RoomsStatusSection: React.FC = () => {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomsStatus()
      .then(setRooms)
      .catch(() => setError("Status der Räume konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress sx={{ my: 2 }} />;
  if (error)
    return (
      <Alert severity="warning" variant="outlined" sx={{ m: 1 }}>
        {error}
      </Alert>
    );

  return (
    <List dense disablePadding>
      {rooms.map((room) => (
        <ListItem
          key={room.id}
          component={Link}
          href={room.url}
          target="_blank"
          rel="noopener noreferrer"
          button // Gives visual feedback on hover
          sx={{ color: "text.primary", textDecoration: "none", borderRadius: 1 }}
          secondaryAction={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Chip
                {...getStatusChipProps(room.status, room.currentBookings, room.maxBookings)}
                size="small"
                sx={{ minWidth: "70px", justifyContent: "center" }}
              />
              {room.status !== "closed" && (
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: "50px", textAlign: "right" }}>
                  {`${room.maxBookings - room.currentBookings} / ${room.maxBookings}`}
                </Typography>
              )}
            </Box>
          }
        >
          <ListItemIcon sx={{ minWidth: "36px", fontSize: "1.2rem" }}>{room.emoji}</ListItemIcon>
          <ListItemText primary={room.name} />
        </ListItem>
      ))}
    </List>
  );
};

/**
 * Renders the compact summary of washing machine availability.
 */
const WashingMachineStatusSection: React.FC = () => {
  const [summary, setSummary] = useState<WashingMachineSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWashingMachineStatus()
      .then(setSummary)
      .catch(() => setError("Status der Waschmaschinen konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress sx={{ my: 2 }} />;
  if (error)
    return (
      <Alert severity="warning" variant="outlined" sx={{ m: 1 }}>
        {error}
      </Alert>
    );

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "space-around", p: 1.5, flexWrap: "wrap", gap: 2 }}
    >
      <LocalLaundryServiceIcon color="action" sx={{ fontSize: 32 }} />
      {summary.map((room) => (
        <Box key={room.roomName} sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {room.roomName}
          </Typography>
          <Typography
            variant="h6"
            color={room.available > 0 ? "success.main" : "text.primary"}
            sx={{ fontWeight: "medium" }}
          >
            {`${room.available} / ${room.total}`}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

/**
 * The main combined component that includes both Rooms and Washing Machine statuses.
 */
const ExternalServicesStatus: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <RoomsStatusSection />
      </Box>
      <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
      <Divider sx={{ my: 1, display: { xs: "block", md: "none" } }} />
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <WashingMachineStatusSection />
      </Box>
    </Box>
  );
};

export default ExternalServicesStatus;
