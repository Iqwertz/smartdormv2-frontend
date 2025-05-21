import apiClient from "./api"; // Note: Changed from "./api" to "./apiClient" if you rename api.ts
import { CreateParcelPayload, Parcel, TenantForSelect } from "../types/parcel";

export const fetchTenantsForSelect = async (): Promise<TenantForSelect[]> => {
  //This function may have to be moved to a shared service file if it is used more in the future
  const response = await apiClient.get<TenantForSelect[]>("/api/common/tenant-list");
  return response.data;
};

export const createParcel = async (data: CreateParcelPayload): Promise<Parcel> => {
  const response = await apiClient.post<Parcel>("/api/department/parcels/create/", data);
  return response.data;
};

export const fetchPendingParcels = async (): Promise<Parcel[]> => {
  const response = await apiClient.get<Parcel[]>("/api/department/parcels/list/");
  return response.data;
};

export const fetchAllParcels = async (): Promise<Parcel[]> => {
  const response = await apiClient.get<Parcel[]>("/api/department/parcels/list/?status=all");
  return response.data;
};

export const markParcelAsPickedUp = async (externalId: string): Promise<Parcel> => {
  const response = await apiClient.post<Parcel>(`/api/department/parcels/${externalId}/pickup/`);
  return response.data;
};
