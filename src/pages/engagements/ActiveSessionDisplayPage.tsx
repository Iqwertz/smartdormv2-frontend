import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Paper, CircularProgress, Stack, Dialog } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import DashboardCard from "../../components/shared/DashboardCard";
import attendanceService, { AttendanceEvent, AttendanceSession } from "../../services/attendanceService";
import { buildAttendanceLink } from "../../utils/attendanceLink";

const PRIMARY_COLOR = "rgb(128, 22, 44)";
const ACCENT_COLOR = "rgb(197, 133, 146)";
const DARK_COLOR = "rgb(59, 6, 6)";

const ActiveSessionDisplayPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [eventName, setEventName] = useState("Anwesenheit");
  const [sessionTitle, setSessionTitle] = useState("Session");
  const [partsCount, setPartsCount] = useState(0);
  const [attendanceCode, setAttendanceCode] = useState<string | null>(null);
  const [currentPart, setCurrentPart] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreenQR, setIsFullscreenQR] = useState(false);
  const navigate = useNavigate();

  const sessionNumber = useMemo(() => (sessionId ? Number.parseInt(sessionId, 10) : NaN), [sessionId]);

  const loadSessionMeta = useCallback(async () => {
    if (!sessionId || Number.isNaN(sessionNumber)) return;

    const eventsRes = await attendanceService.getEvents();
    const sessionMatches = await Promise.all(
      eventsRes.data.map(async (event: AttendanceEvent) => {
        try {
          const sessionsRes = await attendanceService.getSessions(event.id);
          return sessionsRes.data.find((candidate: AttendanceSession) => candidate.id === sessionNumber) ?? null;
        } catch (error) {
          console.error("Could not load sessions for event", event.id, error);
          return null;
        }
      }),
    );

    const matchedSession = sessionMatches.find((candidate): candidate is AttendanceSession => Boolean(candidate));

    if (matchedSession?.event_details) {
      setEventName(matchedSession.event_details.name);
      setPartsCount(matchedSession.event_details.parts_count);
    }

    if (matchedSession?.title) {
      setSessionTitle(matchedSession.title);
    }
  }, [sessionId, sessionNumber]);

  const fetchToken = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const res = await attendanceService.getCurrentToken(parseInt(sessionId, 10));
      setAttendanceCode(res.data.code);
      setCurrentPart(res.data.part);
      setSessionTitle(res.data.session_title || `Session ${sessionId}`);
    } catch (error) {
      console.warn("Could not get token, session might be stopped", error);
      setAttendanceCode(null);
      setCurrentPart(null);
    }
  }, [sessionId]);

  const fetchSessionData = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await loadSessionMeta();
      await fetchToken();
    } catch (error) {
      console.error("Failed to load attendance session data", error);
    } finally {
      setLoading(false);
    }
  }, [fetchToken, loadSessionMeta, sessionId]);

  useEffect(() => {
    fetchSessionData();
    const interval = setInterval(fetchToken, 10000);

    return () => clearInterval(interval);
  }, [fetchSessionData, fetchToken]);

  const handleStopSession = () => {
    if (!sessionId) return;
    attendanceService
      .stopSession(parseInt(sessionId, 10))
      .then(() => navigate("/attendance/manage"))
      .catch(console.error);
  };

  const handleSelectPart = (part: number) => {
    if (!sessionId) return;

    attendanceService
      .startSession(parseInt(sessionId, 10), part)
      .then(() => fetchSessionData())
      .catch(console.error);
  };

  const partOptions = useMemo(() => Array.from({ length: partsCount }, (_, index) => index + 1), [partsCount]);

  if (loading) return <CircularProgress />;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 1,
        py: 2,
        background: "linear-gradient(180deg, rgba(128, 22, 44, 0.06) 0%, rgba(197, 133, 146, 0.05) 100%)",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 760 }}>
        <DashboardCard
          title={`${eventName} · ${sessionTitle}`}
          cardSx={{
            border: `1px solid rgba(197, 133, 146, 0.35)`,
            background: "rgba(255, 255, 255, 0.92)",
          }}
          contentSx={{ p: { xs: 2, md: 3 } }}
        >
          <Stack spacing={3} alignItems="center" justifyContent="center">
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {attendanceCode ? (
                <>
                  <Paper
                    elevation={0}
                    onClick={() => setIsFullscreenQR(true)}
                    sx={{
                      p: 1,
                      borderRadius: 4,
                      bgcolor: "#fff",
                      border: `4px solid ${ACCENT_COLOR}`,
                      boxShadow: "0 16px 40px rgba(128, 22, 44, 0.16)",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.02)" },
                    }}
                  >
                    <QRCodeSVG value={buildAttendanceLink(attendanceCode)} size={420} level="H" />
                  </Paper>
                  <Dialog
                    open={isFullscreenQR}
                    onClose={() => setIsFullscreenQR(false)}
                    maxWidth="xl"
                    PaperProps={{
                      sx: {
                        p: { xs: 2, sm: 4 },
                        borderRadius: 4,
                        bgcolor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 2,
                      },
                    }}
                  >
                    <Box
                      onClick={() => setIsFullscreenQR(false)}
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <QRCodeSVG
                        value={buildAttendanceLink(attendanceCode)}
                        size={1024}
                        level="H"
                        style={{
                          width: "100%",
                          height: "auto",
                          maxWidth: "80vh",
                          maxHeight: "80vh",
                          display: "block",
                        }}
                      />
                    </Box>
                  </Dialog>
                </>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    width: 460,
                    height: 460,
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.72)",
                    border: `2px dashed rgba(197, 133, 146, 0.55)`,
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 999,
                  bgcolor: "rgba(128, 22, 44, 0.08)",
                  color: PRIMARY_COLOR,
                  fontWeight: 800,
                  minWidth: 110,
                  textAlign: "center",
                }}
              >
                {sessionTitle}
              </Box>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="center">
                {partOptions.map((part) => (
                  <Button
                    key={part}
                    variant={part === currentPart ? "contained" : "outlined"}
                    onClick={() => handleSelectPart(part)}
                    sx={{
                      minWidth: 56,
                      borderColor: ACCENT_COLOR,
                      color: part === currentPart ? "#fff" : PRIMARY_COLOR,
                      bgcolor: part === currentPart ? PRIMARY_COLOR : "rgba(255,255,255,0.75)",
                      "&:hover": {
                        borderColor: PRIMARY_COLOR,
                        bgcolor: part === currentPart ? DARK_COLOR : "rgba(197, 133, 146, 0.18)",
                      },
                    }}
                  >
                    {part}
                  </Button>
                ))}
              </Stack>

              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 999,
                  bgcolor: "rgba(128, 22, 44, 0.08)",
                  color: PRIMARY_COLOR,
                  fontWeight: 800,
                  minWidth: 110,
                  textAlign: "center",
                }}
              >
                Part {currentPart ?? "–"}
              </Box>

              <Button
                variant="contained"
                color="error"
                onClick={handleStopSession}
                sx={{
                  bgcolor: DARK_COLOR,
                  "&:hover": { bgcolor: PRIMARY_COLOR },
                }}
              >
                Session beenden
              </Button>
            </Box>
          </Stack>
        </DashboardCard>
      </Box>
    </Box>
  );
};

export default ActiveSessionDisplayPage;
