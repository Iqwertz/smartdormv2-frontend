// src/components/tenants/dashboard/content/DonationNote.tsx
/**
 * Discrete donation call for the HSV fundraiser.
 * Links to the public GoFundMe campaign and optionally reveals the bank details.
 */
import React, { useState } from "react";
import { Box, Button, Collapse, IconButton, Tooltip, Typography } from "@mui/material";
import {
  ContentCopyOutlined,
  ExpandLess,
  ExpandMore,
  FavoriteBorderOutlined,
  OpenInNewOutlined,
} from "@mui/icons-material";
import { useNotification } from "../../../../context/NotificationContext";

const GOFUNDME_URL = "https://www.gofundme.com/f/schollheim-hsv-hilfe";

const BANK_DETAILS = [
  { label: "Empfänger", value: "Studentenwohnheim Geschwister Scholl" },
  { label: "IBAN", value: "DE45 7015 0000 1001 9979 13" },
  { label: "Verwendungszweck", value: "Zuwendung HSV - Steuer" },
];

const DonationNote: React.FC = () => {
  const [showBankDetails, setShowBankDetails] = useState(false);
  const { showNotification } = useNotification();

  const handleCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showNotification(`${label} kopiert.`, "success", 3000);
    } catch (error) {
      console.error("Could not copy to clipboard.", error);
      showNotification("Kopieren nicht möglich. Bitte manuell markieren.", "warning", 4000);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Box display="flex" alignItems="flex-start" gap={1.5}>
        <FavoriteBorderOutlined fontSize="small" sx={{ mt: 0.3, color: "rgb(128, 22, 44)" }} />
        <Typography variant="body2" color="text.secondary">
          Wir sammeln Spenden für die HSV. Jeder Beitrag hilft – vielen Dank für deine Unterstützung!
        </Typography>
      </Box>

      <Button
        variant="contained"
        href={GOFUNDME_URL}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<OpenInNewOutlined />}
        sx={{ textTransform: "none", alignSelf: "flex-start" }}
      >
        Auf GoFundMe spenden
      </Button>

      <Box>
        <Button
          variant="text"
          size="small"
          onClick={() => setShowBankDetails((prev) => !prev)}
          endIcon={showBankDetails ? <ExpandLess /> : <ExpandMore />}
          sx={{ textTransform: "none", p: 0, minWidth: 0, fontWeight: 400 }}
        >
          Oder direkt an unser Konto
        </Button>

        <Collapse in={showBankDetails}>
          <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
            {BANK_DETAILS.map((detail) => (
              <Box key={detail.label} display="flex" alignItems="center" gap={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 110, flexShrink: 0 }}>
                  {detail.label}
                </Typography>
                <Typography variant="caption" sx={{ wordBreak: "break-word" }}>
                  {detail.value}
                </Typography>
                <Tooltip title={`${detail.label} kopieren`}>
                  <IconButton size="small" onClick={() => handleCopy(detail.label, detail.value)}>
                    <ContentCopyOutlined sx={{ fontSize: "0.9rem" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default DonationNote;
