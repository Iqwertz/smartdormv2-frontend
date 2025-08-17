import apiClient from "./api";
import {
  DepartmentForSelect,
  EngagementApplicationData,
  GlobalAppSettings,
  MyEngagementApplication,
} from "../types/tenant";

export const fetchGlobalSettings = async (): Promise<GlobalAppSettings> => {
  const response = await apiClient.get<GlobalAppSettings>("/api/tenants/global-settings/");
  return response.data;
};

export const fetchDepartmentsForSelect = async (): Promise<DepartmentForSelect[]> => {
  const response = await apiClient.get<DepartmentForSelect[]>("/api/common/departments-for-select/");
  return response.data;
};

export const applyForEngagement = async (formData: FormData): Promise<{ message: string }> => {
  const response = await apiClient.post("/api/tenants/engagement-application/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchEngagementApplications = async (): Promise<EngagementApplicationData[]> => {
  const response = await apiClient.get<EngagementApplicationData[]>("/api/tenants/engagement-applications/");
  return response.data;
};

export const fetchMyEngagementApplications = async (): Promise<MyEngagementApplication[]> => {
  const response = await apiClient.get<MyEngagementApplication[]>("/api/tenants/my-engagement-applications/");
  return response.data;
};

export const deleteEngagementApplication = async (applicationId: number): Promise<void> => {
  await apiClient.delete(`/api/tenants/engagement-application/${applicationId}/delete/`);
};

// Heimrat specific services
export const heimratFetchApplications = async (): Promise<EngagementApplicationData[]> => {
  const response = await apiClient.get<EngagementApplicationData[]>("/api/engagements/heimrat/applications/list/");
  return response.data;
};

export const heimratDeleteApplication = async (applicationId: number): Promise<void> => {
  await apiClient.delete(`/api/engagements/heimrat/applications/${applicationId}/delete/`);
};

export const heimratCreateApplication = async (formData: FormData): Promise<{ message: string }> => {
  const response = await apiClient.post("/api/engagements/heimrat/applications/create/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
