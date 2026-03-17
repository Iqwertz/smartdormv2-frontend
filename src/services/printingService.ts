import apiClient from "./api";
import {
  DeviceStatus,
  MyCosts,
  PrintSession,
  PrintSessionDetail,
  PrintJob,
  Scan,
} from "../types/printing";

/**
 * Fetch current device status (available, active session info)
 */
export const fetchDeviceStatus = async (): Promise<DeviceStatus> => {
  const response = await apiClient.get<DeviceStatus>("/api/tenants/printing/device-status/");
  return response.data;
};

/**
 * Fetch user's printing costs overview
 */
export const fetchMyCosts = async (): Promise<MyCosts> => {
  const response = await apiClient.get<MyCosts>("/api/tenants/printing/my-costs/");
  return response.data;
};

/**
 * Fetch user's print sessions
 */
export const fetchMySessions = async (): Promise<PrintSession[]> => {
  const response = await apiClient.get<PrintSession[]>("/api/tenants/printing/my-sessions/");
  return response.data;
};

/**
 * Fetch all scans for the current user (from all sessions)
 */
export const fetchMyScans = async (): Promise<Scan[]> => {
  const response = await apiClient.get<Scan[]>("/api/tenants/printing/my-scans/");
  return response.data;
};

/**
 * Start a new print session
 */
export const startSession = async (): Promise<PrintSession> => {
  const response = await apiClient.post<PrintSession>("/api/tenants/printing/sessions/start/");
  return response.data;
};

/**
 * Get session details (with jobs and scans)
 */
export const fetchSessionDetail = async (sessionId: string): Promise<PrintSessionDetail> => {
  const response = await apiClient.get<PrintSessionDetail>(
    `/api/tenants/printing/sessions/${sessionId}/`
  );
  return response.data;
};

/**
 * End a session
 */
export const endSession = async (sessionId: string): Promise<PrintSession> => {
  const response = await apiClient.post<PrintSession>(
    `/api/tenants/printing/sessions/${sessionId}/end/`
  );
  return response.data;
};

/**
 * Submit a print job (file upload with options)
 */
export const submitPrintJob = async (
  sessionId: string,
  file: File,
  options?: { color_mode?: string; copies?: number }
): Promise<PrintJob> => {
  const formData = new FormData();
  formData.append("file", file);
  if (options) {
    if (options.color_mode) {
      formData.append("color_mode", options.color_mode);
    }
    if (options.copies) {
      formData.append("copies", options.copies.toString());
    }
  }

  const response = await apiClient.post<PrintJob>(
    `/api/tenants/printing/sessions/${sessionId}/print/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * Fetch all jobs for a session
 */
export const fetchSessionJobs = async (sessionId: string): Promise<PrintJob[]> => {
  const response = await apiClient.get<PrintJob[]>(
    `/api/tenants/printing/sessions/${sessionId}/jobs/`
  );
  return response.data;
};

/**
 * Fetch all scans for a session
 */
export const fetchSessionScans = async (sessionId: string): Promise<Scan[]> => {
  const response = await apiClient.get<Scan[]>(
    `/api/tenants/printing/sessions/${sessionId}/scans/`
  );
  return response.data;
};

/**
 * Download a scan file
 */
export const downloadScan = async (scanId: string): Promise<Blob> => {
  const response = await apiClient.get(`/api/tenants/printing/scans/${scanId}/download/`, {
    responseType: "blob",
  });
  return response.data;
};

/**
 * Start a scan job
 */
export const startScan = async (
  sessionId: string,
  options?: { resolution?: number; mode?: string; source?: string }
): Promise<{ scan_id: string; status: string; message?: string }> => {
  const response = await apiClient.post<{ scan_id: string; status: string; message?: string }>(
    `/api/tenants/printing/sessions/${sessionId}/scan/start/`,
    options || {}
  );
  return response.data;
};

// ============================================================================
// Admin Endpoints (for department management)
// ============================================================================

export interface DeviceOverview {
  device: {
    id: number;
    name: string;
    location: string;
    is_active: boolean;
    allow_new_sessions: boolean;
    price_per_page_color: string;
    price_per_page_gray: string;
    max_session_duration_minutes: number;
    cups_printer_name: string;
  };
  active_session: {
    session_id: string;
    tenant_name: string;
    started_at: string;
  } | null;
  statistics: {
    total_sessions: number;
    active_sessions: number;
    total_jobs: number;
    total_pages: number;
    total_revenue: string;
    this_month_pages: number;
    this_month_revenue: string;
  };
}

export interface DeviceStatistics {
  device_id: number;
  device_name: string;
  period: {
    start_date: string | null;
    end_date: string | null;
  };
  sessions: {
    total: number;
    completed: number;
    expired: number;
    terminated: number;
  };
  jobs: {
    total: number;
    completed: number;
    failed: number;
    cancelled: number;
    total_pages: number;
    total_revenue: string;
  };
}

export interface DeviceHistory {
  sessions: PrintSession[];
  jobs: PrintJob[];
}

/**
 * Get device overview for admin
 */
export const fetchDeviceOverview = async (deviceId: number): Promise<DeviceOverview> => {
  const response = await apiClient.get<DeviceOverview>(`/api/printing/device/${deviceId}/overview/`);
  return response.data;
};

/**
 * Get device statistics
 */
export const fetchDeviceStatistics = async (
  deviceId: number,
  startDate?: string,
  endDate?: string
): Promise<DeviceStatistics> => {
  const params: any = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await apiClient.get<DeviceStatistics>(`/api/printing/device/${deviceId}/statistics/`, {
    params,
  });
  return response.data;
};

/**
 * Update device settings
 */
export const updateDeviceSettings = async (
  deviceId: number,
  settings: { price_per_page_color?: string; price_per_page_gray?: string; max_session_duration_minutes?: number }
): Promise<any> => {
  const response = await apiClient.put(`/api/printing/device/${deviceId}/settings/`, settings);
  return response.data;
};

/**
 * Toggle device active/inactive
 */
export const toggleDeviceActive = async (deviceId: number): Promise<any> => {
  const response = await apiClient.post(`/api/printing/device/${deviceId}/toggle-active/`);
  return response.data;
};

/**
 * Toggle allow new sessions
 */
export const toggleDeviceSessions = async (deviceId: number): Promise<any> => {
  const response = await apiClient.post(`/api/printing/device/${deviceId}/toggle-sessions/`);
  return response.data;
};

/**
 * Terminate active session
 */
export const terminateDeviceSession = async (deviceId: number): Promise<PrintSession> => {
  const response = await apiClient.post<PrintSession>(`/api/printing/device/${deviceId}/terminate-session/`);
  return response.data;
};

/**
 * Get device history
 */
export const fetchDeviceHistory = async (
  deviceId: number,
  startDate?: string,
  endDate?: string,
  status?: string
): Promise<DeviceHistory> => {
  const params: any = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (status) params.status = status;
  const response = await apiClient.get<DeviceHistory>(`/api/printing/device/${deviceId}/history/`, {
    params,
  });
  return response.data;
};

// Tenant Billing Overview
export interface TenantBillingOverview {
  tenant_id: number;
  tenant_name: string;
  surname: string;
  name: string;
  email: string;
  current_room: string;
  total_cost: string;
  total_pages: number;
  total_jobs: number;
  total_sessions: number;
  debt: string;
  debt_pages: number;
  debt_jobs: number;
}

export const fetchTenantBillingOverview = async (): Promise<TenantBillingOverview[]> => {
  const response = await apiClient.get(`/api/printing/tenant-billing-overview/`);
  return response.data;
};

export const settleTenantDebt = async (tenantId: number): Promise<any> => {
  const response = await apiClient.post(`/api/printing/tenant/${tenantId}/settle-debt/`);
  return response.data;
};

