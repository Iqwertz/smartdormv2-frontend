import React, { useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { Box, CircularProgress, Alert } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import attendanceService from "../../services/attendanceService";
import DashboardCard from "../../components/shared/DashboardCard";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { getAttendanceCodeFromUrl, parseAttendanceCode } from "../../utils/attendanceLink";
import { ATTENDANCE_RESULT_STORAGE_KEY, ATTENDANCE_CODE_STORAGE_KEY } from "../../utils/attendanceConstants";

interface AttendanceScannerProps {
  onSuccess?: () => void;
  isModal?: boolean;
  active?: boolean;
}

const AttendanceScanner: React.FC<AttendanceScannerProps> = ({ onSuccess, isModal, active = true }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      videoConstraints: {
        facingMode: "environment",
      },
    };
    const html5QrcodeScanner = new Html5QrcodeScanner(uniqueId, config, false);
    scannerRef.current = html5QrcodeScanner;

    const onScanSuccess = (decodedText: string) => {
      if (loadingRef.current) return;

      try {
        const code = getAttendanceCodeFromUrl(decodedText);
        const parsedCode = code ? parseAttendanceCode(code) : null;

        if (!code || !parsedCode) {
          throw new Error("Ungültiger Anwesenheits-QR-Code.");
        }

        // If not authenticated, store code and redirect to login
        if (!authState.isAuthenticated) {
          sessionStorage.setItem(ATTENDANCE_CODE_STORAGE_KEY, code);
          sessionStorage.setItem(ATTENDANCE_RESULT_STORAGE_KEY, JSON.stringify({ type: "awaiting-login" }));
          html5QrcodeScanner.pause(true);
          navigate("/login", { state: { from: location } });
          return;
        }

        setLoading(true);
        loadingRef.current = true;
        setError(null);
        html5QrcodeScanner.pause(true); // Pause scanning while submitting

        attendanceService
          .scanAttendance(code)
          .then((res) => {
            const successMessage = res.data.message || "Erfolgreich eingecheckt!";
            sessionStorage.setItem(
              ATTENDANCE_RESULT_STORAGE_KEY,
              JSON.stringify({ type: "success", message: successMessage }),
            );
            sessionStorage.removeItem(ATTENDANCE_CODE_STORAGE_KEY);
            window.dispatchEvent(new CustomEvent("attendanceResultUpdated"));
            showNotification(successMessage, "success");
            if (onSuccess) {
              if (!unmounted) onSuccess();
            } else {
              if (!unmounted) {
                html5QrcodeScanner.resume();
              }
            }
          })
          .catch((err) => {
            const errorMessage = err.response?.data?.error || "Fehler beim Scannen!";
            sessionStorage.setItem(
              ATTENDANCE_RESULT_STORAGE_KEY,
              JSON.stringify({ type: "error", message: errorMessage }),
            );
            sessionStorage.removeItem(ATTENDANCE_CODE_STORAGE_KEY);
            window.dispatchEvent(new CustomEvent("attendanceResultUpdated"));
            setError(errorMessage);
            showNotification(errorMessage, "error");
            if (!unmounted) {
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
        const errorMessage = "Ungültiges QR Code Format. Zeigt er auf SmartDorm?";
        setError(errorMessage);
        showNotification(errorMessage, "error");
      }
    };

    const onScanFailure = () => {
      // Ignore routine scan errors as it parses wildly
    };

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    return () => {
      unmounted = true;
      shutdownScanner();
    };
  }, [active, onSuccess, shutdownScanner, showNotification, authState.isAuthenticated, navigate, location]);

  const content = (
    <Box sx={{ p: isModal ? 0 : 2, bgcolor: isModal ? "transparent" : "background.paper", borderRadius: 2 }}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
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
