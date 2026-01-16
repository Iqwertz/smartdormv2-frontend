// src/components/tenants/dashboard/content/PointsStatus.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  Alert,
  Step,
  Stepper,
  StepLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { AutoAwesome, AccessTime, TrendingUp, CheckCircle } from "@mui/icons-material";
import apiClient from "../../../../services/api";
import { ContractCalculation, TenantProfile } from "../../../../types/tenant";
import { calculateExtensionStatus, getExtensionDeadline } from "../../../../utils/extensionLogic";
import { fetchContractCalculation } from "../../../../services/engagementService";
import dayjs from "dayjs";
import DashboardCard from "../../../shared/DashboardCard";

const PointsStatus: React.FC = () => {
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [contractCalculation, setContractCalculation] = useState<ContractCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    Promise.all([apiClient.get<TenantProfile>("/api/tenants/profile-data"), fetchContractCalculation()])
      .then(([profileRes, calculationRes]) => {
        setProfile(profileRes.data);
        setContractCalculation(calculationRes);
      })
      .catch(() => setError("Daten konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile || !contractCalculation) return null;

  const currentPoints = profile.current_points || 0;
  const status = calculateExtensionStatus(currentPoints);
  const nextDeadline = getExtensionDeadline(profile.move_in, contractCalculation.subtenancies, status.nextExtension);
  const formattedDeadline = dayjs(nextDeadline).format("DD.MM.YYYY");
  const isDeadlineClose = dayjs(nextDeadline).diff(dayjs(), "month") < 3;

  return (
    <DashboardCard title="Wohnzeit & Punkte">
      <Box sx={{ p: 1 }}>
        {/* Header Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Aktuelle Punkte
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <AutoAwesome sx={{ color: "orange" }} />
              <Typography variant="h5" fontWeight="bold">
                {currentPoints}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="text.secondary">
              Verlängerungen
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
              <CheckCircle color="success" />
              <Typography variant="h5" fontWeight="bold">
                {status.securedExtensions}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Progress Bar Area */}
        <Box sx={{ mb: 3, mt: 3 }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" fontWeight="medium">
              Nächstes Ziel: {status.nextExtension}. Verlängerung
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {status.missingPoints} Punkte fehlen
            </Typography>
          </Box>

          <Box position="relative" display="inline-flex" width="100%">
            <LinearProgress
              variant="determinate"
              value={status.progress}
              sx={{
                width: "100%",
                height: 10,
                borderRadius: 5,
                bgcolor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  bgcolor: "primary.main",
                },
              }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" mt={0.5}>
            <Typography variant="caption" color="text.secondary">
              {currentPoints}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {status.pointsRequired}
            </Typography>
          </Box>
        </Box>

        {/* Info Box / Deadline */}
        <Box
          sx={{
            backgroundColor: isDeadlineClose ? "rgba(237, 108, 2, 0.1)" : "rgba(25, 118, 210, 0.08)",
            borderRadius: 2,
            p: 2,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              p: 1,
              borderRadius: "50%",
              display: "flex",
            }}
          >
            {isDeadlineClose ? <AccessTime color="warning" /> : <TrendingUp color="primary" />}
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              Deadline: {formattedDeadline}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bis zu diesem Datum benötigst du <strong>{status.pointsRequired} Punkte</strong>, um die{" "}
              {status.nextExtension}. Verlängerung zu erhalten.
            </Typography>
          </Box>
        </Box>

        {/* Mini Stepper to visualize thresholds */}
        {!isMobile && (
          <Box sx={{ mt: 3 }}>
            <Stepper alternativeLabel activeStep={status.securedExtensions}>
              {[1, 2, 3, 4, 5].map((level) => {
                const pts = level <= 5 ? [50, 150, 250, 300, 350][level - 1] : "";
                return (
                  <Step key={level}>
                    <StepLabel>
                      <Typography variant="caption" display="block">
                        {level}. Verl.
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {pts} Pkt.
                      </Typography>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
        )}
      </Box>
    </DashboardCard>
  );
};

export default PointsStatus;
