import apiClient from "./api";
import { Claim } from "../types/tenant";

export type ClaimStatusFilter = "CREATED" | "PROCESSING" | "COMPLETED";

export const fetchClaimsByStatus = async (status: ClaimStatusFilter): Promise<Claim[]> => {
  const response = await apiClient.get<Claim[]>("/api/department/claims/list/", { params: { status } });
  return response.data;
};

export const sendClaimReminder = async (claimId: number): Promise<{ message: string }> => {
  const response = await apiClient.post(`/api/department/claims/${claimId}/remind/`);
  return response.data;
};

export const updateClaimStatus = async (claimId: number, newStatus: "PROCESSING"): Promise<Claim> => {
  const response = await apiClient.post<Claim>(`/api/department/claims/${claimId}/status/`, { status: newStatus });
  return response.data;
};

export const processClaimDecision = async (
  claimId: number,
  decision: "APPROVED" | "REJECTED",
  moveOutDate?: string
): Promise<{ message: string }> => {
  const payload: { decision: string; move_out_date?: string } = { decision };
  if (moveOutDate) {
    payload.move_out_date = moveOutDate;
  }
  const response = await apiClient.post(`/api/department/claims/${claimId}/decide/`, payload);
  return response.data;
};
