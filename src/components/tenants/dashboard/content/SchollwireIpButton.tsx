// src/components/tenants/dashboard/content/SchollwireIpButton.tsx
/**
 * Zeigt den Bewohnern die statischen IP-Daten für die LAN-Dose (schollwire) ihres
 * Zimmers und verlinkt die ausführliche Anleitung im Wiki.
 *
 * Sitzt in der Settings-Box und wird deshalb sowohl im Mieter- als auch im
 * Untermieter-Dashboard gerendert. Zimmer und Flur kommen je nach Kontotyp aus
 * unterschiedlichen Endpunkten -- /api/tenants/... ist für Untermieter durch die
 * SubtenantApiGuardMiddleware gesperrt.
 */
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { CheckOutlined, ContentCopyOutlined, LanOutlined, OpenInNewOutlined } from "@mui/icons-material";
import apiClient from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import { fetchMySubtenantProfile } from "../../../../services/subtenantService";
import { TenantProfile } from "../../../../types/tenant";
import { getSchollwireConfig, SCHOLLWIRE_WIKI_URL, SchollwireConfig } from "../../../../utils/schollwireNetwork";

interface RoomLocation {
  room: string | null;
  floor: string | null;
}

interface DetailRow {
  label: string;
  value: string;
  hint?: string;
}

const buildRows = (config: SchollwireConfig): DetailRow[] => [
  {
    label: "IP-Adresse",
    value: config.firstIp,
    hint: `${config.networkPrefix}1 bis ${config.networkPrefix}5`,
  },
  { label: "Subnetzmaske", value: config.subnetMask },
  { label: "Gateway", value: config.gateway },
  { label: "DNS-Server", value: config.dnsServer },
];

const CopyableValue: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard nicht verfügbar (z. B. ohne HTTPS) – Wert kann manuell markiert werden.
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Typography sx={{ fontFamily: "monospace", fontSize: "1rem" }}>{value}</Typography>
      <Tooltip title={copied ? "Kopiert" : "Kopieren"}>
        <IconButton size="small" onClick={handleCopy} aria-label={`${value} kopieren`}>
          {copied ? <CheckOutlined fontSize="small" color="success" /> : <ContentCopyOutlined fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const SchollwireIpButton: React.FC = () => {
  const { authState } = useAuth();
  const [location, setLocation] = useState<RoomLocation | null>(null);
  const [open, setOpen] = useState(false);
  const isSubtenant = authState.user?.is_subtenant === true;

  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const loadLocation = async () => {
      try {
        if (isSubtenant) {
          const profile = await fetchMySubtenantProfile();
          setLocation({ room: profile.room_name, floor: profile.room_floor });
        } else {
          const response = await apiClient.get<TenantProfile>("/api/tenants/profile-data");
          setLocation({ room: response.data.current_room, floor: response.data.current_floor });
        }
      } catch {
        // Ohne Zimmerdaten (z. B. beendete Untermiete) wird der Button einfach nicht angezeigt.
        setLocation(null);
      }
    };
    loadLocation();
  }, [authState.isAuthenticated, isSubtenant]);

  const config = getSchollwireConfig(location?.floor, location?.room);

  // Ohne bekanntes Zimmer lassen sich keine IP-Daten berechnen.
  if (!config || !location) return null;

  return (
    <>
      <Button variant="outlined" color="primary" startIcon={<LanOutlined />} fullWidth onClick={() => setOpen(true)}>
        LAN IP-Daten
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 0.5 }}>
          Deine schollwire IP-Daten
          <Typography variant="body2" color="text.secondary">
            Zimmer {location.room} · Flur {location.floor}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Für die LAN-Dose in deinem Zimmer musst du an jedem direkt angeschlossenen Gerät eine statische IP-Adresse
            einstellen:
          </Typography>

          {buildRows(config).map((row, index) => (
            <Box key={row.label}>
              {index > 0 && <Divider />}
              <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={1}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.label}
                  </Typography>
                  {row.hint && (
                    <Typography variant="caption" color="text.secondary">
                      {row.hint}
                    </Typography>
                  )}
                </Box>
                <CopyableValue value={row.value} />
              </Box>
            </Box>
          ))}

          <Alert severity="warning" sx={{ mt: 2 }}>
            Jedes Gerät braucht eine eigene IP-Adresse. Zwei Geräte mit derselben Adresse führen zu Netzwerkproblemen.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Button
            href={SCHOLLWIRE_WIKI_URL}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewOutlined />}
            sx={{ textTransform: "none" }}
          >
            Zur Anleitung im Wiki
          </Button>
          <Button onClick={() => setOpen(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SchollwireIpButton;
