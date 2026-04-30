// src/utils/extensionLogic.ts
import dayjs from "dayjs";

export const POINT_THRESHOLDS = [75, 150, 250, 300, 350];
const POINTS_PER_EXTRA_LEVEL = 50;

/**
 * Returns the points required for a specific extension number (1-based index).
 */
export const getPointsRequiredForExtension = (extensionNumber: number): number => {
  if (extensionNumber <= 0) return 0;
  if (extensionNumber <= POINT_THRESHOLDS.length) {
    return POINT_THRESHOLDS[extensionNumber - 1];
  }
  // For any extension beyond the 5th, add 50 points per level
  const base = POINT_THRESHOLDS[POINT_THRESHOLDS.length - 1];
  const extraLevels = extensionNumber - POINT_THRESHOLDS.length;
  return base + extraLevels * POINTS_PER_EXTRA_LEVEL;
};

/**
 * Calculates the status of extensions based on current points.
 */
export const calculateExtensionStatus = (currentPoints: number) => {
  let securedExtensions = 0;

  // Check against predefined thresholds
  while (currentPoints >= getPointsRequiredForExtension(securedExtensions + 1)) {
    securedExtensions++;
  }

  const nextExtension = securedExtensions + 1;
  const pointsRequired = getPointsRequiredForExtension(nextExtension);
  const prevThreshold = getPointsRequiredForExtension(securedExtensions); // 0 if none

  // Calculate progress percentage for the current level
  const pointsInLevel = currentPoints - prevThreshold;
  const rangeInLevel = pointsRequired - prevThreshold;
  const progress = Math.min(100, Math.max(0, (pointsInLevel / rangeInLevel) * 100));

  return {
    securedExtensions,
    nextExtension,
    pointsRequired,
    missingPoints: pointsRequired - currentPoints,
    progress,
  };
};

/**
 * Calculates the deadline date by which the points for a specific extension must be collected.
 * Logic:
 * 1. Ext: MoveIn + sublets + 2y 9m
 * 2. Ext: MoveIn + sublets + 3y 9m
 * n. Ext: MoveIn + sublets + (n+1)y + 9m
 */
export const getExtensionDeadline = (moveInDate: string, sublets: number, extensionNumber: number): string => {
  const moveIn = dayjs(moveInDate);
  const yearsToAdd = extensionNumber + 1;
  return moveIn.add(sublets, "month").add(yearsToAdd, "year").add(9, "month").format("YYYY-MM-DD");
};

// --- Converters ---

// Converts days to years (e.g. 1095 days -> 3 Jahre)
export const formatDaysToYearsString = (days: number): string => {
  if (days === 0) return "0 Jahre";
  const years = days / 365;
  // Show integer if exact (3), else 1 decimal (3.5)
  const display = years % 1 === 0 ? years : years.toFixed(1);
  return `${display} ${parseFloat(display.toString()) === 1 ? "Jahr" : "Jahre"}`;
};

export const formatDaysToYears = (days: number): number => {
  const years = days / 365;
  // Show integer if exact (3), else 1 decimal (3.5)
  const display = years % 1 === 0 ? years : years.toFixed(1);
  return parseFloat(display.toString());
};

// Converts days to months (e.g. 60 days -> 2 Monate)
export const formatDaysToMonthsString = (days: number): string => {
  if (days === 0) return "0 Monate";
  // Average days in a month including leap years
  const months = Math.round(days / 30.44);
  return ` ${months} ${months === 1 ? "Monat" : "Monate"}`;
};

export const formatDaysToMonths = (days: number): number => {
  if (days === 0) return 0;
  // Average days in a month including leap years
  const months = Math.round(days / 30.44);
  return months;
};
