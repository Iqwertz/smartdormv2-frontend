import { useCallback, useEffect, useRef, useState } from "react";
import { TourStep } from "../types/tour";

// The sidebar collapses into a hamburger at this width (Sidebar.tsx uses the same value,
// deliberately not a MUI theme breakpoint). Below it there is also no room beside a
// dashboard card for a step bubble, so the tour switches to a pinned bottom sheet.
export const TOUR_COMPACT_BREAKPOINT = 1100;

/** Marks the step bubble so its height can be measured without prop drilling. */
export const TOUR_BUBBLE_ATTRIBUTE = "data-tour-bubble";

export interface TourRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const findAnchor = (step: TourStep): HTMLElement | null => {
  if (!step.anchor) return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${step.anchor}"]`);
  if (el) return el;
  // The LAN button removes itself for rooms it cannot parse, so some steps name a fallback.
  if (step.fallbackAnchor) {
    return document.querySelector<HTMLElement>(`[data-tour="${step.fallbackAnchor}"]`);
  }
  return null;
};

/** Centred steps and sidebar steps on mobile always show; anchored ones only if they exist. */
const isStepShowable = (step: TourStep, isMobile: boolean): boolean => {
  if (!step.anchor) return true;
  if (isMobile && step.centerOnMobile) return true;
  return findAnchor(step) !== null;
};

/**
 * The element that actually scrolls. On the dashboard that is AppLayout's <main>, because
 * global.scss puts `overflow: hidden` on the body - scrolling the window does nothing.
 */
const getScrollParent = (element: HTMLElement): HTMLElement => {
  let node = element.parentElement;
  while (node) {
    const { overflowY } = window.getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement) ?? document.documentElement;
};

/**
 * Centres `element` in the part of the scroll container that is not covered by the bubble.
 * Elements taller than that area are aligned to the top, so at least their heading shows.
 */
const scrollAnchorIntoView = (element: HTMLElement, bottomInset: number) => {
  const container = getScrollParent(element);
  const containerRect =
    container === document.documentElement || container === document.body
      ? { top: 0, height: window.innerHeight }
      : container.getBoundingClientRect();

  const elementRect = element.getBoundingClientRect();
  const usableHeight = containerRect.height - bottomInset;
  const desiredTop = containerRect.top + Math.max(12, (usableHeight - elementRect.height) / 2);

  container.scrollBy({ top: elementRect.top - desiredTop, behavior: "smooth" });
};

const rectsEqual = (a: TourRect | null, b: TourRect | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
};

export const useTour = (steps: TourStep[], open: boolean) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= TOUR_COMPACT_BREAKPOINT);
  const [visibleSteps, setVisibleSteps] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<TourRect | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= TOUR_COMPACT_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Which steps can actually be shown is decided when the tour opens, and again when the
  // layout crosses the sidebar breakpoint. Kept in refs as well as state so recomputing
  // can restore the current step without making this effect depend on the index.
  const visibleStepsRef = useRef<TourStep[]>([]);
  const indexRef = useRef(0);
  indexRef.current = index;

  useEffect(() => {
    if (!open) {
      visibleStepsRef.current = [];
      setVisibleSteps([]);
      setIndex(0);
      setRect(null);
      return;
    }

    const currentId = visibleStepsRef.current[indexRef.current]?.id;
    const showable = steps.filter((step) => isStepShowable(step, isMobile));
    visibleStepsRef.current = showable;
    setVisibleSteps(showable);

    if (!currentId) {
      setIndex(0);
      return;
    }
    // A resize mid-tour must not jump somewhere else, so stay on the same step by id.
    const keptIndex = showable.findIndex((step) => step.id === currentId);
    setIndex(keptIndex >= 0 ? keptIndex : Math.min(indexRef.current, Math.max(showable.length - 1, 0)));
  }, [open, steps, isMobile]);

  const step: TourStep | undefined = visibleSteps[index];
  const isCentered = !step?.anchor || (isMobile && !!step?.centerOnMobile);

  // Bring the highlighted element into view before it gets measured. On compact screens
  // the bubble is pinned to the bottom of the viewport, so that strip has to stay clear -
  // otherwise the card scrolls to the middle and ends up behind the bubble.
  useEffect(() => {
    if (!open || !step || isCentered) return;
    const element = findAnchor(step);
    if (!element) return;

    // Wait a couple of frames so this step's bubble exists and can be measured.
    const timer = window.setTimeout(() => {
      const bubble = document.querySelector<HTMLElement>(`[${TOUR_BUBBLE_ATTRIBUTE}]`);
      const bottomInset = isMobile && bubble ? bubble.getBoundingClientRect().height + 32 : 0;
      scrollAnchorIntoView(element, bottomInset);
    }, 60);

    return () => window.clearTimeout(timer);
  }, [open, step, isCentered, isMobile]);

  // Track the element every frame instead of guessing when smooth scrolling, the mobile
  // card reordering and lazily-loaded cards have settled. State only updates on change.
  const rectRef = useRef<TourRect | null>(null);
  useEffect(() => {
    if (!open || !step || isCentered) {
      rectRef.current = null;
      setRect(null);
      return;
    }
    let frame = 0;
    const measure = () => {
      const el = findAnchor(step);
      const next = el
        ? (() => {
            const r = el.getBoundingClientRect();
            return { top: r.top, left: r.left, width: r.width, height: r.height };
          })()
        : null;
      if (!rectsEqual(rectRef.current, next)) {
        rectRef.current = next;
        setRect(next);
      }
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [open, step, isCentered]);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, visibleSteps.length - 1)), [visibleSteps.length]);
  const back = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  return {
    step,
    index,
    total: visibleSteps.length,
    isFirst: index === 0,
    isLast: index === visibleSteps.length - 1,
    isCentered,
    isMobile,
    rect,
    next,
    back,
  };
};

/**
 * Resolves once the given anchors are in the DOM, or after `timeoutMs` at the latest.
 *
 * Several dashboard cards (points, the move-out breakdown icon) only render after their
 * own request has returned, so starting the tour on mount would silently skip those steps.
 */
export const waitForTourAnchors = (anchors: string[], timeoutMs = 6000): Promise<void> =>
  new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const allPresent = anchors.every((anchor) => document.querySelector(`[data-tour="${anchor}"]`));
      if (allPresent || Date.now() - start >= timeoutMs) {
        resolve();
        return;
      }
      window.setTimeout(check, 150);
    };
    check();
  });
