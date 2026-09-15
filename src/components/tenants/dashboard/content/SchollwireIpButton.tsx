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
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckOutlined,
  ContentCopyOutlined,
  ExpandLessOutlined,
  ExpandMoreOutlined,
  LanOutlined,
  OpenInNewOutlined,
} from "@mui/icons-material";
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

const buildChatGptPrompt = (config: SchollwireConfig): string =>
  `Ich ziehe in ein Wohnheimzimmer mit einer LAN-Dose ein und muss meinen eigenen Router daran anschließen. Ich habe absolut keine Erfahrung mit sowas. Gib mir eine super detaillierte, nummerierte Schritt-für-Schritt-Anleitung wie für ein Kind, die ganz am Anfang beginnt und nichts voraussetzt -- keine Fachbegriffe erklären, einfach nur genau sagen, was ich der Reihe nach tun und anfassen soll. Zum Beispiel in diesem Stil: "Nimm deinen Router. Dreh ihn um und schau auf die Unterseite. Dort findest du einen Aufkleber mit den WLAN-Zugangsdaten (Netzwerkname und Passwort) -- schreib dir diese ab. Verbinde den Router per Netzkabel mit der Steckdose. Verbinde das LAN-Kabel aus der Wanddose mit dem Anschluss am Router, der mit 'WAN' oder 'Internet' beschriftet ist. ..." und so weiter bis ganz zum Schluss.

Am Ende der Anleitung muss ich in den Router-Einstellungen diese festen Werte eintragen -- zeig mir genau, in welchem Menü/Reiter das ist und wie ich jedes Feld ausfülle:
- IP-Adresse: ${config.firstIp}
- Subnetzmaske: ${config.subnetMask}
- Gateway: ${config.gateway}
- DNS-Server: ${config.dnsServer}

Geh am Schluss auch kurz darauf ein, wie ich prüfe, ob alles funktioniert (z. B. ob eine Webseite lädt).

Mein Router/Modell: `;

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
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
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

  const chatGptPrompt = buildChatGptPrompt(config);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(chatGptPrompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 1500);
    } catch {
      // Clipboard nicht verfügbar (z. B. ohne HTTPS) – Prompt kann manuell markiert werden.
    }
  };

  return (
    <>
      <Button variant="outlined" color="primary" startIcon={<LanOutlined />} fullWidth onClick={() => setOpen(true)}>
        LAN IP-Daten
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 0.5 }}>
          Deine scholllan IP-Daten
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

          <Box sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
              <Button
                size="small"
                onClick={() => setPromptOpen((prev) => !prev)}
                endIcon={promptOpen ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
                sx={{ textTransform: "none", pl: 0 }}
              >
                Prompt für AI Anleitung
              </Button>
              <Tooltip title={promptCopied ? "Kopiert" : "Prompt kopieren"}>
                <IconButton size="small" onClick={handleCopyPrompt} aria-label="ChatGPT-Prompt kopieren">
                  {promptCopied ? (
                    <CheckOutlined fontSize="small" color="success" />
                  ) : (
                    <ContentCopyOutlined fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Bevor du einem Netzwerkreferenten schreibts, versuche diesen Prompt an deine lieblings ai und versuch den
              Router damit einzurichten.
            </Typography>
            <Collapse in={promptOpen}>
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  maxHeight: 220,
                  overflowY: "auto",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.78rem" }}
                >
                  {chatGptPrompt}
                </Typography>
              </Box>
            </Collapse>
          </Box>
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
