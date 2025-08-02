import apiClient from "./api";
import { TenantProfile, Departure } from "../types/tenant";

// For Department/Admin roles
export const fetchDepartureCandidates = async (): Promise<TenantProfile[]> => {
  const response = await apiClient.get<TenantProfile[]>("/api/department/departures/candidates/");
  return response.data;
};

export const createDeparture = async (tenantId: number): Promise<Departure> => {
  const response = await apiClient.post<Departure>("/api/department/departures/create/", { tenant_id: tenantId });
  return response.data;
};

export const fetchDeparturesByStatus = async (
  status: "CREATED" | "CONFIRMED" | "POSTPONED" | "CLOSED"
): Promise<Departure[]> => {
  const response = await apiClient.get<Departure[]>("/api/department/departures/list/", { params: { status } });
  return response.data;
};

export const sendDepartureReminder = async (departureId: number): Promise<{ message: string }> => {
  const response = await apiClient.post(`/api/department/departures/${departureId}/remind/`);
  return response.data;
};

export const closeDeparture = async (departureId: number, moveOutDate?: string): Promise<{ message: string }> => {
  const payload = moveOutDate ? { move_out_date: moveOutDate } : {};
  const response = await apiClient.post(`/api/department/departures/${departureId}/close/`, payload);
  return response.data;
};

// For Tenants
export const fetchMyDeparture = async (): Promise<Departure> => {
  const response = await apiClient.get<Departure>("/api/tenants/my-departure/");
  return response.data;
};

export const decideOnDeparture = async (
  decision: "CONFIRM" | "POSTPONE",
  bankDetails?: { name: string; iban: string }
): Promise<{ message: string }> => {
  const payload = { decision, ...bankDetails };
  const response = await apiClient.post("/api/tenants/my-departure/decide/", payload);
  return response.data;
};
