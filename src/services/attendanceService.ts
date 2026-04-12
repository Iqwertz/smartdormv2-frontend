import apiClient from "./api";

export interface AttendanceEvent {
  id: number;
  name: string;
  parts_count: number;
  required_parts: number;
  admin_groups: string[];
  created_at?: string;
}

export interface AttendanceSession {
  id: number;
  event: number;
  event_details: AttendanceEvent;
  date: string;
  status: "CREATED" | "ACTIVE" | "CLOSED";
  current_part: number;
  last_rotated_at: string | null;
}

export interface AttendanceRecord {
  id: number;
  tenant: number;
  tenant_name: string;
  session: number;
  part: number;
  timestamp: string;
  is_manual_override: boolean;
  session_date?: string;
  event_name?: string;
  event_parts_count?: number;
  event_required_parts?: number;
}

export interface QrTokenResponse {
  token: string;
  part: number;
  session_id: number;
}

export interface AttendanceReportTenant {
  tenant_id: number;
  tenant_name: string;
  surname?: string;
  name?: string;
  current_room?: string;
  current_floor?: string;
  parts_attended: number[];
  manual_overrides: number[];
}

export interface AttendanceReportResponse {
  session: AttendanceSession;
  rows: AttendanceReportTenant[];
}

const ATTENDANCE_API = "/api/attendance"; // Base appended in apiClient? No, apiClient base is API_BASE_URL. Routes are mapped to /api/attendance/... Let's use /attendance if api.ts's API_BASE_URL handles /api

export const attendanceService = {
  // Events
  getEvents: () => apiClient.get<AttendanceEvent[]>(`${ATTENDANCE_API}/events/`),
  getManageableEvents: () => apiClient.get<AttendanceEvent[]>(`${ATTENDANCE_API}/events/manageable/`),
  createEvent: (data: Partial<AttendanceEvent>) => apiClient.post<AttendanceEvent>(`${ATTENDANCE_API}/events/`, data),
  updateEvent: (id: number, data: Partial<AttendanceEvent>) =>
    apiClient.put<AttendanceEvent>(`${ATTENDANCE_API}/events/${id}/`, data),
  deleteEvent: (id: number) => apiClient.delete(`${ATTENDANCE_API}/events/${id}/`),

  // Sessions
  getSessions: (eventId: number) => apiClient.get<AttendanceSession[]>(`${ATTENDANCE_API}/events/${eventId}/sessions/`),
  createSession: (eventId: number) =>
    apiClient.post<AttendanceSession>(`${ATTENDANCE_API}/events/${eventId}/sessions/`),
  toggleSessionStatus: (sessionId: number) =>
    apiClient.post<AttendanceSession>(`${ATTENDANCE_API}/sessions/${sessionId}/toggle-status/`),
  deleteSession: (sessionId: number) => apiClient.delete(`${ATTENDANCE_API}/sessions/${sessionId}/delete/`),
  startSession: (sessionId: number, part: number) =>
    apiClient.post<AttendanceSession>(`${ATTENDANCE_API}/sessions/${sessionId}/start/`, { part }),
  stopSession: (sessionId: number) =>
    apiClient.post<AttendanceSession>(`${ATTENDANCE_API}/sessions/${sessionId}/stop/`),

  // Scans & Checks
  getCurrentToken: (sessionId: number) =>
    apiClient.get<QrTokenResponse>(`${ATTENDANCE_API}/sessions/${sessionId}/current-token/`),
  scanAttendance: (sessionId: number, token: string) =>
    apiClient.post<{ message?: string; error?: string }>(`${ATTENDANCE_API}/scan/`, { session_id: sessionId, token }),

  // Reports & Overrides
  getReport: (sessionId: number) =>
    apiClient.get<AttendanceReportResponse>(`${ATTENDANCE_API}/sessions/${sessionId}/report/`),
  manualOverride: (sessionId: number, tenantId: number, part: number, present: boolean) =>
    apiClient.post(`${ATTENDANCE_API}/sessions/${sessionId}/override/`, { tenant_id: tenantId, part, present }),

  // User History
  getMyHistory: () => apiClient.get<AttendanceRecord[]>(`${ATTENDANCE_API}/my-history/`),
};

export default attendanceService;
