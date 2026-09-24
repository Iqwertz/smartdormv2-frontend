import React from "react";
import { Box, Typography } from "@mui/material";
import { TourStep } from "../types/tour";
import TourHint from "../components/tour/TourHint";

/**
 * Content of the introduction tour for new tenants. Kept as a plain config module in the
 * style of routesConfig.tsx and quickLinksConfig - the project has no i18n, so the German
 * strings live directly here.
 *
 * Every `anchor` must match a data-tour attribute rendered on the dashboard or in the
 * sidebar. Steps whose anchor is missing at runtime are skipped rather than shown against
 * an empty rect.
 */

export const tenantTourSteps: TourStep[] = [
  {
    id: "welcome",
    anchor: null,
    title: "Willkommen im Schollheim!",
    body: (
      <Box>
        <Typography variant="body2">
          Das hier ist SmartDorm - dein Portal fürs Heim. Vertragsdaten, Punkte und Wohnzeit, Anwesenheiten,
          Drucken, Räume und Waschmaschinen laufen alle hierüber.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Die kurze Tour zeigt dir in etwa zwei Minuten, was du wo findest - und vor allem, was du am Anfang
          wissen solltest.
        </Typography>
        <TourHint>Du kannst die Tour jederzeit unter "Settings" neu starten.</TourHint>
      </Box>
    ),
  },
  {
    id: "profile",
    anchor: "profile",
    placement: "right",
    title: "Deine Vertragsdaten",
    body: (
      <Box>
        <Typography variant="body2">
          Zimmer, Flur, Einzug, Kaution und dein Punktestand - alles, was die Verwaltung zu deinem Vertrag
          gespeichert hat.
        </Typography>
        <TourHint>Diese Daten kannst du hier nicht ändern. Stimmt etwas nicht, melde dich bei der Verwaltung.</TourHint>
      </Box>
    ),
  },
  {
    id: "move-out-info",
    anchor: "move-out-info",
    fallbackAnchor: "profile",
    placement: "right",
    title: "Woher kommt dein Auszugsdatum?",
    body: (
      <Box>
        <Typography variant="body2">
          Dein Auszugsdatum steht nicht einfach fest - es wird berechnet: Grundmietzeit, deine Verlängerungen,
          Zeiten der Untervermietung und Sonderverlängerungen für Referatsarbeit, am Ende auf das Monatsende
          gerundet.
        </Typography>
        <TourHint>Über dieses ⓘ siehst du die komplette Rechnung Schritt für Schritt.</TourHint>
      </Box>
    ),
  },
  {
    id: "points",
    anchor: "points",
    placement: "left",
    title: "Punkte = längere Wohnzeit",
    body: (
      <Box>
        <Typography variant="body2">
          Das Wichtigste im Heim: Mit Engagement sammelst du Punkte, und Punkte verlängern deine Wohnzeit. Bei
          75, 150, 250, 300 und 350 Punkten sicherst du dir jeweils ein weiteres Jahr.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Die Karte zeigt deinen Stand, wie weit es bis zur nächsten Stufe ist - und bis wann du die Punkte
          haben musst.
        </Typography>
        <TourHint>
          Achte auf die Frist: Punkte, die du erst danach sammelst, retten diese Verlängerung nicht mehr.
        </TourHint>
      </Box>
    ),
  },
  {
    id: "engagements",
    anchor: "engagements",
    placement: "right",
    title: "Deine Referate",
    body: (
      <Typography variant="body2">
        Hier siehst du, in welchen Referaten du warst oder bist - pro Semester und mit den Punkten, die dabei
        zusammengekommen sind. Referatsarbeit ist der übliche Weg, Punkte zu sammeln.
      </Typography>
    ),
  },
  {
    id: "nav-apply-engagement",
    anchor: "nav-apply-engagement",
    placement: "right",
    centerOnMobile: true,
    title: "So kommst du in ein Referat",
    body: (
      <Box>
        <Typography variant="body2">
          Unter "Referatsbewerbungen" bewirbst du dich: Referat auswählen, kurz schreiben, warum du Lust drauf
          hast, optional ein Foto hochladen.
        </Typography>
        <TourHint>
          Das geht nur während der Bewerbungsphase. Außerhalb steht dort "geschlossen" - dann schau zum
          Semesterwechsel nochmal rein.
        </TourHint>
      </Box>
    ),
  },
  {
    id: "attendance-scan",
    anchor: "attendance-scan",
    placement: "left",
    title: "Anwesenheit bei Veranstaltungen",
    body: (
      <Box>
        <Typography variant="body2">
          Bei Heimrat- und Referatsveranstaltungen trägst du dich per QR-Code ein - entweder mit diesem Button
          oder ganz normal mit der Kamera deines Handys.
        </Typography>
        <TourHint>Die Codes wechseln ständig und laufen nach Sekunden ab. Scanne direkt vor Ort, nicht vom Foto.</TourHint>
      </Box>
    ),
  },
  {
    id: "attendance-history",
    anchor: "attendance-history",
    placement: "left",
    title: "Deine Anwesenheiten",
    body: (
      <Typography variant="body2">
        Nach Veranstaltungsart sortiert, mit den Teilen, bei denen du da warst. Anwesenheiten aus dem alten
        System stehen als eine gesammelte Zeile drin.
      </Typography>
    ),
  },
  {
    id: "services",
    anchor: "services",
    placement: "right",
    title: "Räume & Waschmaschinen",
    body: (
      <Box>
        <Typography variant="body2">
          Live-Status der buchbaren Gemeinschaftsräume und der Waschküchen - du siehst auf einen Blick, ob eine
          Maschine frei ist.
        </Typography>
        <TourHint>
          Gebucht wird auf den verlinkten Seiten (rooms.schollheim.net, waschmaschinen.schollheim.net) - mit
          demselben Account wie hier.
        </TourHint>
      </Box>
    ),
  },
  {
    id: "calendar",
    anchor: "calendar",
    placement: "left",
    title: "Kalender",
    body: (
      <Typography variant="body2">
        Was im Heim ansteht. Welche Termine du siehst, hängt von deinen Gruppen ab - in einem Referat siehst du
        mehr. Über "Termin eintragen" kommst du zur Raumbuchung.
      </Typography>
    ),
  },
  {
    id: "quicklinks",
    anchor: "quicklinks",
    placement: "left",
    title: "Wiki, Cloud & Co.",
    body: (
      <Box>
        <Typography variant="body2">
          Die Dienste rund ums Heim: Notion, SchollCloud, Wiki, Raumbuchung, Kalender und Waschmaschinen.
        </Typography>
        <TourHint>Überall derselbe Account wie hier. Im Wiki stehen die ausführlichen Anleitungen.</TourHint>
      </Box>
    ),
  },
  {
    id: "nav-print",
    anchor: "nav-print",
    placement: "right",
    centerOnMobile: true,
    title: "Drucken & Scannen",
    body: (
      <Box>
        <Typography variant="body2">
          Unter "Drucken" nutzt du den gemeinsamen Drucker. Wichtig: Erst eine Session starten - es kann immer
          nur eine Person gleichzeitig drucken, und nach 30 Minuten ist Schluss. Hochladen geht nur als PDF.
        </Typography>
        <TourHint>Die Kosten laufen als Guthaben-Konto mit und werden über die Verwaltung abgerechnet.</TourHint>
      </Box>
    ),
  },
  {
    id: "lan-ip",
    anchor: "lan-ip",
    fallbackAnchor: "settings",
    placement: "left",
    title: "Netzwerk im Zimmer",
    body: (
      <Box>
        <Typography variant="body2">
          Die LAN-Dose im Zimmer vergibt <strong>keine Adressen automatisch</strong>. Jedes Gerät, das du
          direkt ansteckst, musst du von Hand einstellen - IP, Subnetzmaske, Gateway und DNS.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Genau diese Werte für dein Zimmer stehen hinter "LAN IP-Daten"; pro Zimmer sind fünf Adressen
          nutzbar.
        </Typography>
        <TourHint>Falls dir das nichts sagt: Im Dialog liegt ein fertiger ChatGPT-Text und ein Link ins Wiki.</TourHint>
      </Box>
    ),
  },
  {
    id: "nav-hsv",
    anchor: "nav-hsv",
    placement: "right",
    centerOnMobile: true,
    title: "Wer ist wofür zuständig?",
    body: (
      <Typography variant="body2">
        Unter "HSV" findest du die Heimselbstverwaltung: alle Referate mit ihren Referent:innen und die
        Flursprecher:innen - such einfach nach Name, Zimmer oder Flur. Die erste Anlaufstelle bei Fragen.
      </Typography>
    ),
  },
  {
    id: "finish",
    anchor: null,
    title: "Fertig!",
    body: (
      <Box>
        <Typography variant="body2">Zwei Dinge noch:</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Unter "Settings" änderst du dein Passwort - das ist der Account für alle Heim-Dienste.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Und wenn die Verwaltung irgendwann deinen Auszug anstößt, erscheint hier auf dem Dashboard ein
          Fenster. Dort bestätigst du den Auszug <strong>oder beantragst eine Verlängerung</strong> - bitte
          nicht einfach wegklicken.
        </Typography>
        <TourHint>Die Tour kannst du unter "Settings" jederzeit nochmal starten.</TourHint>
      </Box>
    ),
  },
];
