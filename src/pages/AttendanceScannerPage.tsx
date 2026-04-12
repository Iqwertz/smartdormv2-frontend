import React, { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Box, Typography, Button, Container, CircularProgress, Alert } from "@mui/material";
import attendanceService from "../services/attendanceService";

const AttendanceScannerPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = React.useRef<Html5QrcodeScanner | null>(null);

  React.useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      scannerRef.current?.clear().catch(console.error);
    };
  }, []);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    if (loading) return;
    
    try {
      const data = JSON.parse(decodedText);
      const sessionId = parseInt(data.sessionId, 10);
      const token = data.token;

      if (!sessionId || !token) throw new Error("Invalid QR Code Format");

      setLoading(true);
      setError(null);
      scannerRef.current?.pause(true); // Pause scanning while submitting

      attendanceService.scanAttendance(sessionId, token)
        .then((res) => {
          setScanResult(res.data.message || "Erfolgreich eingecheckt!");
          setTimeout(() => {
            setScanResult(null);
            scannerRef.current?.resume();
          }, 3000);
        })
        .catch((err) => {
          setError(err.response?.data?.error || "Fehler beim Scannen!");
          setTimeout(() => {
            setError(null);
            scannerRef.current?.resume();
          }, 3000);
        })
        .finally(() => setLoading(false));

    } catch (e) {
      console.warn(e);
      setError("Ungültiges QR Code Format. Zeigt er auf SmartDorm?");
      setTimeout(() => setError(null), 3000);
    }
  };

  const onScanFailure = (error: any) => {
    // Ignore routine scan errors as it parses wildly
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Anwesenheit scannen
      </Typography>
      <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
        {scanResult && <Alert severity="success" sx={{ mb: 2 }}>{scanResult}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}><CircularProgress /></Box>}
        
        <Box id="qr-reader" sx={{ width: "100%", overflow: "hidden" }} />
      </Box>
    </Container>
  );
};

export default AttendanceScannerPage;
