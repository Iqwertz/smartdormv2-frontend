import React, { useCallback } from "react";
import { tenantTourSteps } from "../../config/tenantTourSteps";
import { useTour } from "../../hooks/useTour";
import { completeTutorial } from "../../services/onboardingService";
import { useNotification } from "../../context/NotificationContext";
import TourOverlay from "./TourOverlay";

interface TenantTourProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The introduction tour for tenants. Ending it - finished or skipped - persists the flag,
 * because either way the tenant has answered the question of whether they want to see it.
 */
const TenantTour: React.FC<TenantTourProps> = ({ open, onClose }) => {
  const tour = useTour(tenantTourSteps, open);
  const { showNotification } = useNotification();
  const { index } = tour;

  const end = useCallback(
    async (finished: boolean) => {
      // Close first: a failing request must never trap the tenant inside the overlay.
      onClose();
      try {
        await completeTutorial(index + 1);
      } catch (error) {
        console.error("Tutorial-Status konnte nicht gespeichert werden.", error);
        return;
      }
      if (finished) {
        showNotification("Tour abgeschlossen. Du findest sie jederzeit unter Settings.", "success");
      }
    },
    [index, onClose, showNotification],
  );

  if (!open || !tour.step) return null;

  return (
    <TourOverlay
      step={tour.step}
      index={tour.index}
      total={tour.total}
      isFirst={tour.isFirst}
      isLast={tour.isLast}
      isCentered={tour.isCentered}
      isMobile={tour.isMobile}
      rect={tour.rect}
      onNext={tour.next}
      onBack={tour.back}
      onSkip={() => end(false)}
      onFinish={() => end(true)}
    />
  );
};

export default TenantTour;
