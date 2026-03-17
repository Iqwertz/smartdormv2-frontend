export interface DeviceStatus {
  device_id: number;
  device_name: string;
  location: string;
  is_active: boolean;
  allow_new_sessions: boolean;
  price_per_page_color: string;
  price_per_page_gray: string;
  active_session: {
    session_id: string;
    tenant_name: string;
    started_at: string;
    is_mine: boolean;
  } | null;
  available: boolean;
}

export interface MyCosts {
  total_cost: string;
  this_month_cost: string;
  total_pages: number;
  this_month_pages: number;
  total_jobs: number;
  this_month_jobs: number;
  debt: string;
  debt_pages: number;
  debt_jobs: number;
}

export interface PrintSession {
  id: number;
  external_id: string;
  tenant: number;
  tenant_name: string;
  device: number;
  device_name: string;
  started_at: string;
  ended_at: string | null;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "TERMINATED";
  total_cost?: string;
}

export interface PrintSessionDetail extends PrintSession {
  jobs: PrintJob[];
  scans: Scan[];
}

export interface PrintJob {
  id: number;
  external_id: string;
  session: number;
  tenant: number;
  tenant_name: string;
  device: number;
  filename: string;
  color_mode: "Color" | "Gray";
  pages: number | null;
  cost: string | null;
  status: "PENDING" | "PRINTING" | "COMPLETED" | "FAILED" | "CANCELLED";
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  cups_job_id: string | null;
}

export interface Scan {
  id: number;
  external_id: string;
  session: number;
  tenant: number;
  tenant_name: string;
  device: number;
  filename: string;
  file_path: string;
  scanned_at: string;
  download_url: string;
}

