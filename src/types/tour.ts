export type TourPlacement = "top" | "bottom" | "left" | "right";

export interface TourStep {
  id: string;
  /**
   * The value of the data-tour attribute to spotlight, or null for a centred step.
   * Steps whose anchor is not in the DOM are skipped at runtime.
   */
  anchor: string | null;
  /** Used when `anchor` is missing, e.g. the LAN button hides itself for unparseable rooms. */
  fallbackAnchor?: string;
  title: string;
  body: React.ReactNode;
  placement?: TourPlacement;
  /**
   * Render centred instead of spotlighted below 1100px. Set for sidebar steps: the sidebar
   * collapses into a hamburger there, so its entries are not on screen to point at.
   */
  centerOnMobile?: boolean;
}
