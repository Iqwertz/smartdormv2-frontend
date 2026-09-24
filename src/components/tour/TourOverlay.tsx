import React from "react";
import ReactDOM from "react-dom";
import { Box, Button, Paper, Popper, Typography } from "@mui/material";
import { TourStep } from "../../types/tour";
import { TourRect, TOUR_BUBBLE_ATTRIBUTE } from "../../hooks/useTour";
import TourHint from "./TourHint";

interface TourOverlayProps {
  step: TourStep;
  index: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  isCentered: boolean;
  isMobile: boolean;
  rect: TourRect | null;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

// Above the sidebar (max 1000 in Sidebar.scss) and above MUI's modal layer, so nothing
// pokes through the dimmed area.
const Z_INDEX = 1400;
const SPOTLIGHT_PADDING = 8;

const TourOverlay: React.FC<TourOverlayProps> = ({
  step,
  index,
  total,
  isFirst,
  isLast,
  isCentered,
  isMobile,
  rect,
  onNext,
  onBack,
  onSkip,
  onFinish,
}) => {
  // An anchored step without a measured rect yet would flash the bubble in the wrong
  // place, so wait one frame for the measurement.
  if (!isCentered && !rect) return null;

  const bubble = (
    <Paper
      {...{ [TOUR_BUBBLE_ATTRIBUTE]: "" }}
      elevation={8}
      sx={{
        width: isMobile ? "100%" : 380,
        maxWidth: isMobile ? "none" : 380,
        // Long steps must never grow past the viewport - they scroll inside the bubble
        // instead, so the buttons stay reachable on small screens. The pinned variant is
        // capped harder because it also has to leave the highlighted card visible.
        maxHeight: isMobile && !isCentered ? "50vh" : "80vh",
        overflowY: "auto",
        p: 2,
        borderRadius: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>
        {step.title}
      </Typography>
      <Box sx={{ mb: 2 }}>
        {step.body}
        {/* Sidebar steps have nothing to point at once the sidebar is a hamburger, so say
            where to look instead. */}
        {isMobile && step.centerOnMobile && <TourHint>Du findest das im Menü oben links ☰</TourHint>}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: "auto" }}>
          {index + 1} / {total}
        </Typography>
        {!isLast && (
          <Button size="small" onClick={onSkip} color="inherit">
            Überspringen
          </Button>
        )}
        {!isFirst && (
          <Button size="small" onClick={onBack}>
            Zurück
          </Button>
        )}
        <Button size="small" variant="contained" onClick={isLast ? onFinish : onNext}>
          {isLast ? "Los geht's" : isFirst ? "Tour starten" : "Weiter"}
        </Button>
      </Box>
    </Paper>
  );

  // On compact screens there is no room beside a card, and letting Popper flip and shift
  // pushed the bubble off screen. Pinning it to the bottom keeps it in frame at every
  // step; useTour reserves this strip when scrolling the highlighted card into view.
  const pinnedBubble = (
    <Box
      sx={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        zIndex: Z_INDEX + 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      {bubble}
    </Box>
  );

  return ReactDOM.createPortal(
    <>
      {/* Blocks interaction with the page underneath. For anchored steps it stays
          transparent because the spotlight's own shadow does the dimming. */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: Z_INDEX,
          backgroundColor: isCentered ? "rgba(0, 0, 0, 0.6)" : "transparent",
        }}
      />

      {!isCentered && rect && (
        <Box
          sx={{
            position: "fixed",
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
            borderRadius: "10px",
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            pointerEvents: "none",
            zIndex: Z_INDEX + 1,
            // No CSS transition: the rect is re-measured every frame, so a transition
            // would trail the card while the page is still scrolling.
          }}
        />
      )}

      {isCentered ? (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: Z_INDEX + 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            pointerEvents: "none",
          }}
        >
          <Box sx={{ pointerEvents: "auto", width: { xs: "100%", sm: "auto" } }}>{bubble}</Box>
        </Box>
      ) : isMobile ? (
        pinnedBubble
      ) : (
        <Popper
          open
          placement={step.placement ?? "bottom"}
          anchorEl={{
            // Virtual anchor: the rect is re-measured every frame, so the bubble follows
            // scrolling and the mobile card reordering without extra listeners.
            getBoundingClientRect: () =>
              ({
                top: rect!.top,
                left: rect!.left,
                right: rect!.left + rect!.width,
                bottom: rect!.top + rect!.height,
                width: rect!.width,
                height: rect!.height,
                x: rect!.left,
                y: rect!.top,
                toJSON: () => "",
              }) as DOMRect,
          }}
          modifiers={[
            { name: "offset", options: { offset: [0, 16] } },
            // altAxis keeps the bubble inside the viewport on the cross axis too, which
            // matters for the tall cards the tour points at.
            { name: "preventOverflow", options: { padding: 12, altAxis: true } },
            { name: "flip", options: { padding: 12 } },
          ]}
          sx={{ zIndex: Z_INDEX + 2 }}
        >
          {bubble}
        </Popper>
      )}
    </>,
    document.body,
  );
};

export default TourOverlay;
