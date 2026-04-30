import React, { useCallback, useEffect, useState } from "react";
import { Button, Stack, Typography, Alert, AlertColor, Box, Paper, CardContent } from "@mui/material";

export interface AttendanceResult {
  type: "success" | "error" | "awaiting-login";
  message?: string;
}

interface AttendanceResultPopupProps {
  storageKey: string;
  onClosed?: () => void;
}

const AttendanceResultPopup: React.FC<AttendanceResultPopupProps> = ({ storageKey, onClosed }) => {
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const checkAndLoadResult = useCallback(() => {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AttendanceResult;
        setResult(parsed);
        setIsOpen(true);
      } catch (e) {
        console.error("Failed to parse attendance result:", e);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    checkAndLoadResult();
  }, [checkAndLoadResult]);

  useEffect(() => {
    const handleAttendanceResult = () => {
      checkAndLoadResult();
    };
    window.addEventListener("attendanceResultUpdated", handleAttendanceResult as EventListener);
    return () => window.removeEventListener("attendanceResultUpdated", handleAttendanceResult as EventListener);
  }, [checkAndLoadResult]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    sessionStorage.removeItem(storageKey);
    setResult(null);
    onClosed?.();
  }, [storageKey, onClosed]);

  if (!result) {
    return null;
  }

  const isSuccess = result.type === "success";
  const isError = result.type === "error";
  const isAwaitingLogin = result.type === "awaiting-login";

  let severity: AlertColor = "info";
  if (isSuccess) {
    severity = "success";
  } else if (isError) {
    severity = "error";
  } else if (isAwaitingLogin) {
    severity = "warning";
  }

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
        pointerEvents: "auto",
      }}
    >
      {/* Backdrop */}
      <Box
        onClick={handleClose}
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      />

      {/* Card Container - matching DashboardCard */}
      <Box sx={{ position: "relative", mt: 2, maxWidth: "sm", width: "90%", zIndex: 2 }}>
        {/* Title Box - elevated like DashboardCard */}
        {result && (
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              top: -12,
              left: 20,
              zIndex: 9,
              backgroundColor: "rgb(128, 22, 44);",
              px: 2,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" color="#f1f1f1">
              {isSuccess && "Anwesenheit registriert"}
              {isError && "Fehler"}
              {isAwaitingLogin && "Login erforderlich"}
            </Typography>
          </Paper>
        )}

        {/* Main Card - matching DashboardCard */}
        <Paper
          elevation={6}
          sx={{
            position: "relative",
            zIndex: 2,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: 2,
            overflow: "hidden",
            pt: 2,
          }}
        >
          <CardContent sx={{ display: "flex", flexDirection: "column" }}>
            <Box>
              <Stack spacing={2}>
                <Alert severity={severity}>{result.message || "Anwesenheit erfolgreich registriert."}</Alert>
                {isError && (
                  <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                    Hinweis: Bitte stelle sicher, dass der Code nicht zu alt ist. Versuche den Link erneut zu scannen.
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button onClick={handleClose} variant="contained" color={isSuccess ? "success" : "warning"}>
                {isSuccess ? "Fertig" : "Verstanden"}
              </Button>
            </Box>
          </CardContent>
        </Paper>
      </Box>
    </Box>
  );
};

export default AttendanceResultPopup;
