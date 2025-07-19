import apiClient from "./api";
import { TenantProfile, Departure, SignSignaturePayload, DepartmentSignature } from "../types/tenant";

export const fetchDepartureCandidates = async (): Promise<TenantProfile[]> => {
  const response = await apiClient.get<TenantProfile[]>("/api/department/departures/candidates/");
  return response.data;
};

export const createDeparture = async (tenantId: number): Promise<Departure> => {
  const response = await apiClient.post<Departure>("/api/department/departures/create/", { tenant_id: tenantId });
  return response.data;
};

export const fetchDepartures = async (status: "PENDING" | "CLOSED"): Promise<Departure[]> => {
  const response = await apiClient.get<Departure[]>("/api/department/departures/list/", { params: { status } });
  return response.data;
};

export const fetchDeparturesForSigning = async (): Promise<Departure[]> => {
  const response = await apiClient.get<Departure[]>("/api/department/departures/for-signing/");
  return response.data;
};

export const signSignature = async (
  signatureId: number,
  payload: SignSignaturePayload
): Promise<DepartmentSignature> => {
  const response = await apiClient.put<DepartmentSignature>(
    `/api/department/departures/signatures/${signatureId}/sign/`,
    payload
  );
  return response.data;
};

export const closeDeparture = async (tenantId: number): Promise<Departure> => {
  const response = await apiClient.post<Departure>(`/api/department/departures/${tenantId}/close/`);
  return response.data;
};
