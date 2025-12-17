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
 * Submit a print job (file upload)
 */
export const submitPrintJob = async (
  sessionId: string,
  file: File
): Promise<PrintJob> => {
  const formData = new FormData();
  formData.append("file", file);

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

