// src/context/NotificationContext.tsx
import React, { createContext, useState, useContext, ReactNode, SyntheticEvent } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
  duration: number | null; // Auto-hide duration (null for persistent)
}

interface NotificationContextProps {
  showNotification: (message: string, severity?: AlertColor, duration?: number | null) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info", // Default severity
    duration: 6000, // Default duration (6 seconds)
  });

  const showNotification = (
    message: string,
    severity: AlertColor = "info",
    duration: number | null = 6000 // Default duration override
  ) => {
    setNotification({ open: true, message, severity, duration });
  };

  const handleClose = (event?: SyntheticEvent | Event, reason?: string) => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
