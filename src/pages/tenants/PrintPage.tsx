import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import DashboardCard from "../../components/shared/DashboardCard";
import "../../styles/bento-layout.scss";
import {
  fetchDeviceStatus,
  fetchMyCosts,
  fetchMySessions,
  fetchMyScans,
  startSession,
  endSession,
  fetchSessionDetail,
  submitPrintJob,
  downloadScan,
  startScan,
} from "../../services/printingService";
import { useNotification } from "../../context/NotificationContext";
import { DeviceStatus, PrintSession, PrintSessionDetail, PrintJob, Scan } from "../../types/printing";
import PrintIcon from "@mui/icons-material/Print";
import ScannerIcon from "@mui/icons-material/Scanner";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const PrintPage: React.FC = () => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [myCosts, setMyCosts] = useState<{ total_cost: string; this_month_cost: string } | null>(null);
  const [mySessions, setMySessions] = useState<PrintSession[]>([]);
  const [myScans, setMyScans] = useState<Scan[]>([]);
  const [activeSession, setActiveSession] = useState<PrintSessionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [startingSession, setStartingSession] = useState<boolean>(false);
  const [endingSession, setEndingSession] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [colorMode, setColorMode] = useState<string>("Color");
  const [copies, setCopies] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showNotification } = useNotification();

  // Load device status and user data
  const loadData = async () => {
    setLoading(true);
    try {
      const [status, costs, sessions, scans] = await Promise.all([
        fetchDeviceStatus(),
        fetchMyCosts().catch(() => null), // Ignore if fails (tenant not found)
        fetchMySessions(),
        fetchMyScans().catch(() => []), // Ignore if fails
      ]);

      setDeviceStatus(status);
      setMyCosts(costs);
      setMySessions(sessions);
      setMyScans(scans);

      // Load active session detail if exists
      if (status.active_session && status.active_session.is_mine) {
        try {
            const sessionDetail = await fetchSessionDetail(status.active_session.session_id);
          setActiveSession(sessionDetail);
          
          // Calculate time left (30 minutes default - should come from device config in future)
          const sessionStart = dayjs(sessionDetail.started_at);
          const maxDuration = 30; // minutes - TODO: Get from device.max_session_duration_minutes when available in API
          const elapsed = dayjs().diff(sessionStart, "minute");
          const remaining = Math.max(0, maxDuration - elapsed);
          setSessionTimeLeft(remaining);
        } catch (error) {
          console.error("Failed to load session detail:", error);
        }
      } else {
        setActiveSession(null);
        setSessionTimeLeft(null);
      }
    } catch (error: any) {
      console.error("Failed to load print data:", error);
      showNotification("Fehler beim Laden der Druckerinformationen.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update only active session data (for auto-refresh of scans and jobs)
  const refreshActiveSession = async () => {
    if (!activeSession) return;
    
    try {
      const [sessionDetail, scans] = await Promise.all([
        fetchSessionDetail(activeSession.external_id),
        fetchMyScans().catch(() => []), // Refresh all scans too
      ]);
      setActiveSession(sessionDetail);
      setMyScans(scans);
    } catch (error) {
      console.error("Failed to refresh session:", error);
      // Silent fail - don't show notification for background refresh
    }
  };

  useEffect(() => {
    loadData();
  }, []); // Load once on mount

  // Auto-refresh only scans and jobs (not full page reload)
  useEffect(() => {
    if (!activeSession) return;

    // Refresh session data every 10 seconds (only scans and jobs, not full page)
    const interval = setInterval(() => {
      refreshActiveSession();
    }, 10000);

    return () => clearInterval(interval);
  }, [activeSession?.external_id]); // Refresh when active session changes

  // Update time left every minute
  useEffect(() => {
    if (!activeSession) return;

    const calculateTimeLeft = () => {
      const sessionStart = dayjs(activeSession.started_at);
      const maxDuration = 30; // minutes
      const elapsed = dayjs().diff(sessionStart, "minute");
      const remaining = Math.max(0, maxDuration - elapsed);
      setSessionTimeLeft(remaining);
    };

    calculateTimeLeft(); // Calculate immediately
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [activeSession]);

  const handleStartSession = async () => {
    setStartingSession(true);
    try {
      const session = await startSession();
      showNotification("Session erfolgreich gestartet!", "success");
      await loadData();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Fehler beim Starten der Session.";
      showNotification(errorMessage, "error");
    } finally {
      setStartingSession(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    setEndingSession(true);
    try {
      await endSession(activeSession.external_id);
      showNotification("Session beendet.", "success");
      setActiveSession(null);
      await loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Fehler beim Beenden der Session.";
      showNotification(errorMessage, "error");
    } finally {
      setEndingSession(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      showNotification("Nur PDF-Dateien werden unterstützt.", "error");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Store file for configuration
    setSelectedFile(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePrintSubmit = async () => {
    if (!selectedFile || !activeSession) return;

    setUploading(true);
    try {
      await submitPrintJob(activeSession.external_id, selectedFile, {
        color_mode: colorMode,
        copies: copies,
      });
      showNotification("Druckauftrag erfolgreich gesendet!", "success");
      setSelectedFile(null);
      setColorMode("Color");
      setCopies(1);
      await loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Fehler beim Senden des Druckauftrags.";
      showNotification(errorMessage, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setColorMode("Color");
    setCopies(1);
  };

  const handleDownloadScan = async (scan: Scan) => {
    try {
      const blob = await downloadScan(scan.external_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = scan.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      showNotification("Fehler beim Herunterladen des Scans.", "error");
    }
  };

  const handleStartScan = async () => {
    if (!activeSession) return;

    setScanning(true);
    try {
      await startScan(activeSession.external_id, {
        resolution: 300,
        mode: "Color",
        source: "Flatbed",
      });
      showNotification("Scan gestartet! Bitte warten Sie, bis der Scan fertig ist.", "success");
      // Starte Polling für neuen Scan
      setTimeout(() => {
        refreshActiveSession();
      }, 3000); // Nach 3 Sekunden erste Aktualisierung
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Fehler beim Starten des Scans.";
      showNotification(errorMessage, "error");
    } finally {
      setScanning(false);
    }
  };

  const formatTimeLeft = (minutes: number | null): string => {
    if (minutes === null) return "";
    if (minutes <= 0) return "Abgelaufen";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getStatusColor = (status: string): "default" | "success" | "error" | "warning" => {
    switch (status) {
      case "COMPLETED":
      case "ACTIVE":
        return "success";
      case "FAILED":
      case "EXPIRED":
      case "TERMINATED":
        return "error";
      case "PRINTING":
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!deviceStatus) {
    return (
      <Box sx={{ px: 1, py: 1 }}>
        <Alert severity="error">Kein Drucker gefunden.</Alert>
      </Box>
    );
  }

  const isMySessionActive = deviceStatus.active_session?.is_mine ?? false;
  const isOtherSessionActive = deviceStatus.active_session && !deviceStatus.active_session.is_mine;
  const canStartSession = deviceStatus.available && !deviceStatus.active_session;

  return (
    <Box sx={{ px: 1, py: 1, maxWidth: "1000px", margin: "0 auto" }} className="page-root">
      <div className="grid">
        <div className="left">
          {/* Device Status */}
          <DashboardCard title="Druckerstatus">
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {deviceStatus.device_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {deviceStatus.location}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={deviceStatus.available ? "Verfügbar" : "Belegt"}
                  color={deviceStatus.available ? "success" : "warning"}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`${deviceStatus.price_per_page_color} €/Seite (Farbe) / ${deviceStatus.price_per_page_gray} €/Seite (SW)`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            {isOtherSessionActive && deviceStatus.active_session && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Belegt von: {deviceStatus.active_session.tenant_name}
              </Alert>
            )}

            {!isMySessionActive && canStartSession && (
              <Button
                variant="contained"
                fullWidth
                startIcon={<PlayArrowIcon />}
                onClick={handleStartSession}
                disabled={startingSession}
                sx={{ mt: 2 }}
              >
                {startingSession ? "Starte..." : "Session starten"}
              </Button>
            )}
          </DashboardCard>

          {/* My Costs */}
          {myCosts && (
            <DashboardCard title="Meine Kosten">
              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Gesamt:</strong> {parseFloat(myCosts.total_cost).toFixed(2)} €
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Dieser Monat:</strong> {parseFloat(myCosts.this_month_cost).toFixed(2)} €
                </Typography>
              </Box>
            </DashboardCard>
          )}

          {/* My Scans - All Scans */}
          {myScans.length > 0 && (
            <DashboardCard title="Meine Scans">
              <List dense>
                {myScans.slice(0, 5).map((scan: Scan) => (
                  <ListItem
                    key={scan.id}
                    divider
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleDownloadScan(scan)}
                        size="small"
                      >
                        <DownloadIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <ScannerIcon fontSize="small" />
                          <Typography variant="body2">{scan.filename}</Typography>
                        </Box>
                      }
                      secondary={dayjs(scan.scanned_at).format("DD.MM.YYYY HH:mm")}
                    />
                  </ListItem>
                ))}
              </List>
              {myScans.length > 5 && (
                <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1 }}>
                  Zeige die letzten 5 von {myScans.length} Scans
                </Typography>
              )}
            </DashboardCard>
          )}

          {/* Past Sessions */}
          {mySessions.length > 0 && (
            <DashboardCard title="Vergangene Sessions">
              <List dense>
                {mySessions.slice(0, 5).map((session) => (
                  <ListItem key={session.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2">
                            {dayjs(session.started_at).format("DD.MM.YYYY HH:mm")}
                          </Typography>
                          <Chip
                            label={session.status}
                            size="small"
                            color={getStatusColor(session.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {session.ended_at
                              ? `Beendet: ${dayjs(session.ended_at).format("HH:mm")}`
                              : "Aktiv"}
                          </Typography>
                          {session.total_cost && parseFloat(session.total_cost) > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Kosten: {parseFloat(session.total_cost).toFixed(2)} €
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </DashboardCard>
          )}
        </div>

        <div className="right">
              {/* Active Session */}
          {isMySessionActive && activeSession && (
            <>
              <DashboardCard 
                title="Aktive Session"
                action={
                  <IconButton
                    size="small"
                    onClick={loadData}
                    disabled={loading}
                    title="Aktualisieren"
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="body2">
                      Gestartet: {dayjs(activeSession.started_at).format("DD.MM.YYYY HH:mm")}
                    </Typography>
                    {sessionTimeLeft !== null && (
                      <Chip
                        label={`Verbleibend: ${formatTimeLeft(sessionTimeLeft)}`}
                        color={sessionTimeLeft < 5 ? "warning" : "success"}
                        size="small"
                      />
                    )}
                  </Box>

                  {sessionTimeLeft !== null && sessionTimeLeft > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={(sessionTimeLeft / 30) * 100}
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<StopIcon />}
                    onClick={handleEndSession}
                    disabled={endingSession}
                  >
                    {endingSession ? "Beende..." : "Session beenden"}
                  </Button>
                </Box>
              </DashboardCard>

              {/* Print Section */}
              <DashboardCard title="Drucken">
                <Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  {!selectedFile ? (
                    <>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<PrintIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sessionTimeLeft === 0}
                        sx={{ mb: 2 }}
                      >
                        PDF auswählen
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        Nur PDF-Dateien werden unterstützt.
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Box sx={{ mb: 2, p: 2, bgcolor: "background.paper", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Ausgewählte Datei:</strong> {selectedFile.name}
                        </Typography>
                        
                        <FormControl component="fieldset" sx={{ mt: 2, mb: 2, width: "100%" }}>
                          <FormLabel component="legend">Farbmodus</FormLabel>
                          <RadioGroup
                            row
                            value={colorMode}
                            onChange={(e) => setColorMode(e.target.value)}
                          >
                            <FormControlLabel value="Color" control={<Radio />} label="Farbe" />
                            <FormControlLabel value="Gray" control={<Radio />} label="Schwarz-Weiß" />
                          </RadioGroup>
                        </FormControl>

                        <TextField
                          label="Anzahl Kopien"
                          type="number"
                          value={copies}
                          onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                          inputProps={{ min: 1, max: 10 }}
                          fullWidth
                          size="small"
                          sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<PrintIcon />}
                            onClick={handlePrintSubmit}
                            disabled={uploading || sessionTimeLeft === 0}
                          >
                            {uploading ? "Druckt..." : "Drucken"}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={handleClearFile}
                            disabled={uploading}
                          >
                            Abbrechen
                          </Button>
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              </DashboardCard>

              {/* Scan Section */}
              <DashboardCard title="Scannen">
                <Box>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ScannerIcon />}
                    onClick={handleStartScan}
                    disabled={scanning || sessionTimeLeft === 0}
                    sx={{ mb: 2 }}
                  >
                    {scanning ? "Scan wird gestartet..." : "Scan starten"}
                  </Button>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Legen Sie das Dokument auf den Scanner und klicken Sie auf "Scan starten".
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Der Scan erscheint automatisch in der Liste, sobald er fertig ist.
                  </Typography>
                </Box>
              </DashboardCard>

              {/* Print Jobs */}
              {activeSession.jobs.length > 0 && (
                <DashboardCard title="Druckaufträge">
                  <List dense>
                    {activeSession.jobs.map((job: PrintJob) => (
                      <ListItem key={job.id} divider>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                              <Typography variant="body2">{job.filename}</Typography>
                              <Chip
                                label={job.status}
                                size="small"
                                color={getStatusColor(job.status)}
                              />
                              {job.pages && (
                                <Chip
                                  label={`${job.pages} Seiten`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {job.cost && (
                                <Chip
                                  label={`${parseFloat(job.cost).toFixed(2)} €`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            job.error_message
                              ? `Fehler: ${job.error_message}`
                              : dayjs(job.created_at).format("HH:mm:ss")
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </DashboardCard>
              )}

            </>
          )}

          {/* No Active Session */}
          {!isMySessionActive && (
            <DashboardCard title="Session">
              <Alert severity="info">
                {isOtherSessionActive
                  ? "Der Drucker ist aktuell von einem anderen Nutzer belegt."
                  : "Starte eine Session, um zu drucken oder zu scannen."}
              </Alert>
            </DashboardCard>
          )}
        </div>
      </div>
    </Box>
  );
};

export default PrintPage;

