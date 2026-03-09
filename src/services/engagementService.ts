import apiClient from "./api";
import {
  DepartmentForSelect,
  EngagementApplicationData,
  GlobalAppSettings,
  MyEngagementApplication,
  AdminEngagement,
  EngagementCreatePayload,
  TenantOverview,
  EngagementOverviewGroup,
  ContractCalculation,
  TenantStatistics
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

//Engagement Management

export const fetchEngagementsAdmin = async (compensated: boolean): Promise<AdminEngagement[]> => {
  const response = await apiClient.get<AdminEngagement[]>("/api/engagements/heimrat/engagements/list/", {
    params: { compensated },
  });
  return response.data;
};

export const createEngagementAdmin = async (payload: EngagementCreatePayload): Promise<AdminEngagement> => {
  const response = await apiClient.post<AdminEngagement>("/api/engagements/heimrat/engagements/create/", payload);
  return response.data;
};

export const updateEngagement = async (
  engagementId: number,
  points: number,
  note: string
): Promise<AdminEngagement> => {
  const response = await apiClient.put<AdminEngagement>(
    `/api/engagements/heimrat/engagements/${engagementId}/update/`,
    { points, note }
  );
  return response.data;
};

export const deleteEngagementAdmin = async (engagementId: number): Promise<void> => {
  await apiClient.delete(`/api/engagements/heimrat/engagements/${engagementId}/delete/`);
};

export const fetchTenantOverviewData = async (): Promise<TenantOverview[]> => {
  const response = await apiClient.get<TenantOverview[]>("/api/engagements/misc/tenant-overview-data/");
  return response.data;
};

export const fetchEngagementOverviewData = async (): Promise<EngagementOverviewGroup[]> => {
  const response = await apiClient.get<EngagementOverviewGroup[]>("/api/engagements/misc/engagement-overview-data/");
  return response.data;
};

export const fetchTenantStatistics = async (scope: "current" | "all" = "current"): Promise<TenantStatistics> => {
  const response = await apiClient.get<TenantStatistics>("/api/engagements/misc/tenant-statistics/", {
    params: { scope },
  });
  return response.data;
};

export const compensateAllEngagements = async (): Promise<{ message: string }> => {
  const response = await apiClient.post("/api/engagements/heimrat/engagements/compensate-all/");
  return response.data;
};

export const compensateEngagement = async (engagementId: number): Promise<{ message: string }> => {
  const response = await apiClient.put(`/api/engagements/heimrat/engagements/${engagementId}/toggle-compensate/`);
  return response.data;
};

export const updateSemesterAndLdap = async (newSemester: string): Promise<{ message: string }> => {
  const response = await apiClient.post("/api/engagements/heimrat/update-semester-and-ldap/", {
    new_semester: newSemester,
  });
  return response.data;
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

export const fetchContractCalculation = async (): Promise<ContractCalculation> => {
  const response = await apiClient.get<ContractCalculation>("/api/tenants/my-contract-calculation");
  return response.data;
};