import { ATTENDANCE_CODE_SEPARATOR, ATTENDANCE_LINK_CODE_PARAM, ATTENDANCE_LINK_ROUTE } from "../config";

export interface AttendanceCodeParts {
  sessionId: number;
  token: string;
}

export const buildAttendanceCode = (sessionId: number | string, token: string) =>
  `${sessionId}${ATTENDANCE_CODE_SEPARATOR}${token}`;

export const parseAttendanceCode = (code: string): AttendanceCodeParts | null => {
  const separatorIndex = code.indexOf(ATTENDANCE_CODE_SEPARATOR);

  if (separatorIndex <= 0) {
    return null;
  }

  const sessionIdText = code.slice(0, separatorIndex);
  const token = code.slice(separatorIndex + ATTENDANCE_CODE_SEPARATOR.length).trim();
  const sessionId = Number.parseInt(sessionIdText, 10);

  if (!Number.isInteger(sessionId) || sessionId < 1 || !token) {
    return null;
  }

  return { sessionId, token };
};

export const buildAttendanceLink = (code: string) => {
  const url = new URL(ATTENDANCE_LINK_ROUTE, window.location.origin);
  url.searchParams.set(ATTENDANCE_LINK_CODE_PARAM, code);
  return url.toString();
};

export const getAttendanceCodeFromUrl = (input: string): string | null => {
  try {
    const url = new URL(input, window.location.origin);
    return url.searchParams.get(ATTENDANCE_LINK_CODE_PARAM);
  } catch {
    return null;
  }
};
