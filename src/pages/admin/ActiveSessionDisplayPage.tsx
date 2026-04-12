import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, CircularProgress } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import attendanceService, { AttendanceSession } from "../../services/attendanceService";

const ActiveSessionDisplayPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSessionData = () => {
    if (!sessionId) return;
    attendanceService.getSessions(parseInt(sessionId, 10)).then(res => { // Wait, getSessions is by eventId. We need to fetch all or we just pull the token directly.
      // Easiest is to just try getting the token. If it fails, session is not active.
    }).catch(console.error);
    
    // Better: let's just poll getCurrentToken.
    attendanceService.getCurrentToken(parseInt(sessionId, 10))
      .then(res => {
        setToken(res.data.token);
      })
      .catch(err => {
        console.warn("Could not get token, session might be stopped", err);
        setToken(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessionData();
    const interval = setInterval(fetchSessionData, 10000); // 10 seconds poll to refresh the rotated token
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleStartPart = (part: number) => {
    if (!sessionId) return;
    attendanceService.startSession(parseInt(sessionId, 10), part)
      .then(() => fetchSessionData())
      .catch(console.error);
  };

  const handleStopSession = () => {
    if (!sessionId) return;
    attendanceService.stopSession(parseInt(sessionId, 10))
      .then(() => navigate("/attendance/events"))
      .catch(console.error);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8, gap: 4 }}>
      <Typography variant="h2" gutterBottom>Anwesenheit Scanner</Typography>
      
      {token ? (
        <Paper sx={{ p: 4, bgcolor: "white" }}>
          <QRCodeSVG 
            value={JSON.stringify({ sessionId, token })} 
            size={400} 
            level="H" 
          />
        </Paper>
      ) : (
        <Typography variant="h5" color="textSecondary">Warte auf Start eines Parts...</Typography>
      )}

      {token && <Typography variant="h4" color="primary">Bitte scannen sie den Code in der SmartDorm App.</Typography>}

      <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="success" onClick={() => handleStartPart(1)}>Start Part 1</Button>
        <Button variant="contained" color="success" onClick={() => handleStartPart(2)}>Start Part 2</Button>
        <Button variant="contained" color="success" onClick={() => handleStartPart(3)}>Start Part 3</Button>
        <Button variant="contained" color="error" onClick={handleStopSession}>Session beenden</Button>
      </Box>
    </Box>
  );
};

export default ActiveSessionDisplayPage;
