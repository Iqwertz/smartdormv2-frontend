import React, { useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { Box, Typography, Container, CircularProgress, Alert } from "@mui/material";
import attendanceService from "../../services/attendanceService";
import DashboardCard from "../../components/shared/DashboardCard";
import { useNotification } from "../../context/NotificationContext";

interface AttendanceScannerProps {
  onSuccess?: () => void;
  isModal?: boolean;
  active?: boolean;
}

const AttendanceScanner: React.FC<AttendanceScannerProps> = ({ onSuccess, isModal, active = true }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const scannerRef = React.useRef<Html5QrcodeScanner | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const loadingRef = React.useRef(false);

  const shutdownScanner = React.useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }

    if (containerRef.current) {
      const videos = containerRef.current.querySelectorAll("video");
      videos.forEach((video) => {
        const mediaStream = video.srcObject as MediaStream | null;
        mediaStream?.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      });

      containerRef.current.innerHTML = "";
    }
  }, []);

  React.useEffect(() => {
    if (!active) {
      shutdownScanner();
    }
  }, [active, shutdownScanner]);

  React.useEffect(() => {
    if (!active) return;
    if (!containerRef.current) return;
    let unmounted = false;

    const uniqueId = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const innerWrapper = document.createElement("div");
    innerWrapper.id = uniqueId;
    containerRef.current.appendChild(innerWrapper);

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };
    const html5QrcodeScanner = new Html5QrcodeScanner(uniqueId, config, false);
    scannerRef.current = html5QrcodeScanner;

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
      if (loadingRef.current) return;

      try {
        const data = JSON.parse(decodedText);
        const sessionId = parseInt(data.sessionId, 10);
        const token = data.token;

        if (!sessionId || !token) throw new Error("Invalid QR Code Format");

        setLoading(true);
        loadingRef.current = true;
        setError(null);
        html5QrcodeScanner.pause(true); // Pause scanning while submitting

        attendanceService
          .scanAttendance(sessionId, token)
          .then((res) => {
            showNotification(res.data.message || "Erfolgreich eingecheckt!", "success");
            if (onSuccess) {
              if (!unmounted) onSuccess();
            } else {
              if (!unmounted) {
                html5QrcodeScanner.resume();
              }
            }
          })
          .catch((err) => {
            setError(err.response?.data?.error || "Fehler beim Scannen!");
            showNotification(error || "Fehler beim Scannen!", "error");
            if (!unmounted) {
              setError(null);
              html5QrcodeScanner.resume();
            }
          })
          .finally(() => {
            if (!unmounted) {
              setLoading(false);
              loadingRef.current = false;
            }
          });
      } catch (e) {
        console.warn(e);
        setError("Ungültiges QR Code Format. Zeigt er auf SmartDorm?");
        showNotification(error || "Ungültiges QR Code Format. Zeigt er auf SmartDorm?", "error");
        if (!unmounted) {
          setError(null);
        }
      }
    };

    const onScanFailure = (error: any) => {
      // Ignore routine scan errors as it parses wildly
    };

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    return () => {
      unmounted = true;
      shutdownScanner();
    };
  }, [active, onSuccess, shutdownScanner]);

  const content = (
    <Box sx={{ p: isModal ? 0 : 2, bgcolor: isModal ? "transparent" : "background.paper", borderRadius: 2 }}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* The DOM element needed by html5-qrcode */}
      <Box ref={containerRef} sx={{ width: "100%", overflow: "hidden" }} />
    </Box>
  );

  if (isModal) {
    return content;
  }

  return (
    <Box sx={{ maxWidth: "sm", margin: "0 auto", mt: 4 }} className="page-root">
      <DashboardCard title="Anwesenheit scannen">{content}</DashboardCard>
    </Box>
  );
};

export default AttendanceScanner;
