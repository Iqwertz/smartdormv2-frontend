/**
 * Calculates the previous academic semester.
 * @param currentSemester - The current semester in format "SS24" or "WS23/24"
 * @returns The previous semester string, or empty string if format is invalid
 */
export function getPreviousSemester(currentSemester: string): string {
  // Check for summer semester format (e.g., "SS24")
  const ssMatch = currentSemester.match(/^SS(\d{2})$/);
  if (ssMatch) {
    const year = parseInt(ssMatch[1], 10);
    const prevYear = (year - 1 + 100) % 100; // Handles year 00 correctly
    return `WS${prevYear.toString().padStart(2, "0")}/${year.toString().padStart(2, "0")}`;
  }

  // Check for winter semester format (e.g., "WS23/24")
  const wsMatch = currentSemester.match(/^WS(\d{2})\/(\d{2})$/);
  if (wsMatch) {
    const startYear = parseInt(wsMatch[1], 10);
    return `SS${startYear.toString().padStart(2, "0")}`;
  }

  console.warn(`Could not determine previous semester for unrecognized format: ${currentSemester}`);
  return "";
}

export function getNextSemester(currentSemester: string): string {
  // Check for summer semester format (e.g., "SS24")
  const ssMatch = currentSemester.match(/^SS(\d{2})$/);
  if (ssMatch) {
    const year = parseInt(ssMatch[1], 10);
    const nextYear = (year + 1) % 100; // Handles year 00 correctly
    return `WS${year.toString().padStart(2, "0")}/${nextYear.toString().padStart(2, "0")}`;
  }

  // Check for winter semester format (e.g., "WS23/24")
  const wsMatch = currentSemester.match(/^WS(\d{2})\/(\d{2})$/);
  if (wsMatch) {
    const endYear = parseInt(wsMatch[2], 10);
    return `SS${endYear.toString().padStart(2, "0")}`;
  }

  console.warn(`Could not determine next semester for unrecognized format: ${currentSemester}`);
  return "";
}

export function isValidSemesterFormat(semester: string): boolean {
  return /^(SS\d{2}|WS\d{2}\/\d{2})$/.test(semester);
}

export function isHigherSemester(semA: string, semB: string): boolean {
  const semesterOrder = (sem: string): number => {
    const ssMatch = sem.match(/^SS(\d{2})$/);
    if (ssMatch) {
      return parseInt(ssMatch[1], 10) * 2; // Summer semester is even
    }
    const wsMatch = sem.match(/^WS(\d{2})\/(\d{2})$/);
    if (wsMatch) {
      return parseInt(wsMatch[1], 10) * 2 + 1; // Winter semester is odd
    }
    return -1; // Invalid format
  };

  return semesterOrder(semA) > semesterOrder(semB);
}
