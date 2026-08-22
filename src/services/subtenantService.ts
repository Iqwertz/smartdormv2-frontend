import apiClient from "./api";
import { SubtenantOwnProfile } from "../types/tenant";

// Data a subtenant may read about their own sublet. Every other API path is closed to
// subtenant accounts by the backend's SubtenantApiGuardMiddleware.
export const fetchMySubtenantProfile = async (): Promise<SubtenantOwnProfile> => {
  const response = await apiClient.get<SubtenantOwnProfile>("/api/subtenant/profile-data/");
  return response.data;
};
