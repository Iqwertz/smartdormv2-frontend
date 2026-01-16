import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  CalendarToday,
  AddCircleOutline,
  DateRange,
  EventBusy,
  ExpandMore,
  Calculate,
  Apartment,
  WorkHistory,
  HomeOutlined,
  Close,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { fetchContractCalculation } from "../../../../services/engagementService";
import { ContractCalculation } from "../../../../types/tenant";
import { formatDaysToMonthsString, formatDaysToYearsString } from "../../../../utils/extensionLogic";

interface ContractCalculationModalProps {
  open: boolean;
  onClose: () => void;
}

const ContractCalculationModal: React.FC<ContractCalculationModalProps> = ({ open, onClose }) => {
  const [data, setData] = useState<ContractCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchContractCalculation()
        .then(setData)
        .catch(() => setError("Vertragsdetails konnten nicht geladen werden."))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const formatDate = (date: string | null) => (date ? dayjs(date).format("DD.MM.YYYY") : "N/A");

  // --- Layout Component ---

  const CalculationRow: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subValue?: string;
    detail?: string;
    isNegative?: boolean;
    highlight?: boolean;
    isTotal?: boolean;
  }> = ({ icon, title, value, subValue, detail, isNegative, highlight, isTotal }) => (
    <ListItem
      disablePadding
      sx={{
        bgcolor: highlight ? "rgba(25, 118, 210, 0.08)" : "transparent",
        borderRadius: 2,
        mb: 1.5,
        p: 1,
        alignItems: "flex-start", // Aligns icon to top to prevent shifting
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: isMobile ? 32 : 40, // Tighter spacing on mobile
          mt: 0.5,
          color: isNegative ? "error.main" : isTotal ? "white" : "primary.main",
        }}
      >
        {icon}
      </ListItemIcon>

      {/* Flex container for the content to handle spacing properly */}
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 1 }}>
        {/* Left Side: Title and Details */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography
            variant={isMobile ? "body2" : "body1"}
            fontWeight={500}
            color={isTotal ? "inherit" : "text.primary"}
          >
            {title}
          </Typography>
          {(subValue || detail) && (
            <Box sx={{ mt: 0.5 }}>
              {subValue && (
                <Typography
                  variant="caption"
                  display="block"
                  color={isTotal ? "inherit" : "text.secondary"}
                  sx={{ lineHeight: 1.2 }}
                >
                  ({subValue})
                </Typography>
              )}
              {detail && (
                <Typography
                  variant="caption"
                  display="block"
                  color={isTotal ? "inherit" : "text.secondary"}
                  sx={{ lineHeight: 1.2 }}
                >
                  {detail}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Right Side: Value (Values kept strictly to the right) */}
        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          <Typography
            variant={isMobile ? "body2" : "h6"}
            fontWeight="bold"
            color={isNegative ? "error.main" : isTotal ? "inherit" : "text.primary"}
            sx={{ fontSize: isTotal && !isMobile ? "1.25rem" : undefined }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </ListItem>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { margin: isMobile ? 1 : 4, maxHeight: "90vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #eee",
          pb: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Calculate color="primary" />
          <Typography variant="h6">Mietzeit Berechnung</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, px: isMobile ? 1.5 : 3 }}>
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}

        {data && !loading && (
          <List disablePadding>
            {/* 1. Einzug */}
            <CalculationRow icon={<HomeOutlined />} title="Einzugsdatum" value={formatDate(data.move_in_date)} />

            {/* 2. Basisdauer (Years) */}
            <CalculationRow
              icon={<CalendarToday />}
              title="Basis-Mietdauer"
              value={`+ ${formatDaysToYearsString(data.base_contract.duration_days)}`}
              subValue={`${data.base_contract.duration_days} Tage`}
            />

            {/* 3. Verlängerungen (Years) */}
            {data.standard_extensions.count > 0 && (
              <CalculationRow
                icon={<AddCircleOutline />}
                title={`Verlängerungen (${data.standard_extensions.count})`}
                value={`+ ${formatDaysToYearsString(data.standard_extensions.total_added_days)}`}
                subValue={`${data.standard_extensions.total_added_days} Tage`}
                detail="Wohnzeitverlängerungen"
              />
            )}

            {/* 4. Untervermietung (Months) */}
            {data.subtenancies.total_added_days > 0 && (
              <Box>
                <CalculationRow
                  icon={<Apartment />}
                  title="Untervermietung"
                  value={`+ ${formatDaysToMonthsString(data.subtenancies.total_added_days)}`}
                  subValue={`${data.subtenancies.total_added_days} Tage Gutschrift`}
                />
                <Accordion variant="outlined" sx={{ mb: 2, mt: -1, borderRadius: 2, "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="caption">Details ({data.subtenancies.count} Untermieter)</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 1, px: 2, bgcolor: "background.default" }}>
                    <List dense disablePadding>
                      {data.subtenancies.details.map((sub, idx) => (
                        <ListItem key={idx} disablePadding sx={{ py: 0.5, borderBottom: "1px dashed #eee" }}>
                          <Box display="flex" justifyContent="space-between" width="100%">
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(sub.start)} - {formatDate(sub.end)}
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              +{sub.days} Tage
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}

            {/* 5. Referatsverlängerungen (Months) */}
            {data.department_extensions.total_months > 0 && (
              <Box>
                <CalculationRow
                  icon={<WorkHistory />}
                  title="Sonderverlängerungen"
                  value={`+ ${data.department_extensions.total_months} Monate`}
                />
                <Accordion variant="outlined" sx={{ mb: 2, mt: -1, borderRadius: 2, "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="caption">Details anzeigen</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 1, px: 2, bgcolor: "background.default" }}>
                    <List dense disablePadding>
                      {data.department_extensions.details.map((ext, idx) => (
                        <ListItem key={idx} disablePadding sx={{ py: 0.5, borderBottom: "1px dashed #eee" }}>
                          <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                            <Typography variant="caption" sx={{ maxWidth: "70%" }} noWrap title={ext.note || ""}>
                              {ext.note || "Keine Notiz"}
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              +{ext.months} Mon.
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            {/* 6. Zwischenergebnis */}
            <CalculationRow
              icon={<DateRange />}
              title="Berechnetes Vertragsende"
              value={formatDate(data.calculation_steps.calculated_end_of_month)}
              subValue="Auf Monatsende gerundet"
            />

            {/* 7. Kündigung Override */}
            {data.termination.is_active && (
              <Box
                sx={{
                  mt: 1,
                  p: 1,
                  border: "1px solid",
                  borderColor: "error.light",
                  borderRadius: 2,
                  bgcolor: "#fff5f5",
                }}
              >
                <CalculationRow
                  icon={<EventBusy />}
                  title="Vorzeitige Kündigung"
                  value={formatDate(data.termination.date)}
                  isNegative
                  detail={data.termination.note ? `Grund: ${data.termination.note}` : undefined}
                />
                <Typography variant="caption" color="error" sx={{ px: 1, display: "block", mt: -1 }}>
                  * Ersetzt reguläres Ende
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractCalculationModal;
