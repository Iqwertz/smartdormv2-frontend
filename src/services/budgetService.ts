import apiClient from "./api";
import { BudgetRequest, BudgetEngagement } from "../types/budget";

export const fetchBudgetPermissions = async (): Promise<BudgetEngagement[]> => {
  const response = await apiClient.get<BudgetEngagement[]>("/api/engagements/budget/my-permissions/");
  return response.data;
};

export const fetchBudgetRequests = async (status?: string): Promise<BudgetRequest[]> => {
  const params = status ? { status } : {};
  const response = await apiClient.get<BudgetRequest[]>("/api/engagements/budget/list/", { params });
  return response.data;
};

export const createBudgetRequest = async (formData: FormData): Promise<BudgetRequest> => {
  const response = await apiClient.post("/api/engagements/budget/create/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const voteBudgetRequest = async (id: number, vote: "APPROVE" | "REJECT"): Promise<void> => {
  await apiClient.post(`/api/engagements/budget/${id}/vote/`, { vote });
};

export const manageBudgetRequest = async (id: number, action: "APPROVE" | "REJECT" | "PAID"): Promise<void> => {
  await apiClient.post(`/api/engagements/budget/${id}/manage/`, { action });
};

export const deleteBudgetRequest = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/engagements/budget/${id}/delete/`);
};
