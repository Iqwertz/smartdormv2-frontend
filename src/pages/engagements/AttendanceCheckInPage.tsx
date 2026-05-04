import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import attendanceService from "../../services/attendanceService";
import { ATTENDANCE_LINK_CODE_PARAM } from "../../config";
import { parseAttendanceCode } from "../../utils/attendanceLink";
import { ATTENDANCE_RESULT_STORAGE_KEY, ATTENDANCE_CODE_STORAGE_KEY } from "../../utils/attendanceConstants";

const AttendanceCheckInPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const processingRef = useRef(false);

  const code = useMemo(() => searchParams.get(ATTENDANCE_LINK_CODE_PARAM), [searchParams]);
  const parsedCode = useMemo(() => (code ? parseAttendanceCode(code) : null), [code]);

  useEffect(() => {
    if (processingRef.current) return;
    if (!code || !parsedCode) return;
    if (authState.loading) return;

    processingRef.current = true;

    const handleAttendance = async () => {
      if (!authState.isAuthenticated) {
        sessionStorage.setItem(ATTENDANCE_CODE_STORAGE_KEY, code);
        sessionStorage.setItem(ATTENDANCE_RESULT_STORAGE_KEY, JSON.stringify({ type: "awaiting-login" }));
        navigate("/login", { state: { from: location } });
        return;
      }

      try {
        const response = await attendanceService.scanAttendance(code);
        const successMessage = response.data.message || "Erfolgreich eingecheckt!";
        sessionStorage.setItem(
          ATTENDANCE_RESULT_STORAGE_KEY,
          JSON.stringify({ type: "success", message: successMessage }),
        );
        sessionStorage.removeItem(ATTENDANCE_CODE_STORAGE_KEY);
      } catch (error: unknown) {
        const responseError = error as { response?: { status?: number; data?: { error?: string; message?: string } } };
        const responseMessage =
          responseError.response?.data?.error ||
          responseError.response?.data?.message ||
          "Fehler beim Registrieren der Anwesenheit.";
        const isExpiredToken =
          responseMessage.toLowerCase().includes("expired") || responseMessage.toLowerCase().includes("invalid");
        const displayMessage = isExpiredToken
          ? `Fehler: ${responseMessage}. Du warst möglicherweise zu langsam. Bitte versuche es erneut.`
          : responseMessage;
        sessionStorage.setItem(
          ATTENDANCE_RESULT_STORAGE_KEY,
          JSON.stringify({ type: "error", message: displayMessage }),
        );
        sessionStorage.removeItem(ATTENDANCE_CODE_STORAGE_KEY);
      }

      window.dispatchEvent(new CustomEvent("attendanceResultUpdated"));
      navigate("/dashboard", { replace: true });
    };

    void handleAttendance();
  }, [code, parsedCode, authState.isAuthenticated, authState.loading, navigate, location]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, rgba(128, 22, 44, 0.06) 0%, rgba(197, 133, 146, 0.05) 100%)",
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default AttendanceCheckInPage;
