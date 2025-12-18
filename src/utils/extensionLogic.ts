// src/utils/extensionLogic.ts
import dayjs from "dayjs";

export const POINT_THRESHOLDS = [50, 150, 250, 300, 350];
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
  return base + (extraLevels * POINTS_PER_EXTRA_LEVEL);
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
    progress
  };
};

/**
 * Calculates the deadline date by which the points for a specific extension must be collected.
 * Logic: 
 * 1. Ext: MoveIn + 2y 9m
 * 2. Ext: MoveIn + 3y 9m
 * n. Ext: MoveIn + (n+1)y + 9m
 */
export const getExtensionDeadline = (moveInDate: string, extensionNumber: number): string => {
  const moveIn = dayjs(moveInDate);
  const yearsToAdd = extensionNumber + 1;
  return moveIn.add(yearsToAdd, 'year').add(9, 'month').format('YYYY-MM-DD');
};