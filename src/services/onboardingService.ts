import apiClient from "./api";

// State of the tenant introduction tour. Stored in t_tenant_onboarding on the backend but
// read back as TenantProfile.tutorial_completed, so there is no fetch counterpart here.

export const completeTutorial = async (lastStep: number): Promise<void> => {
  await apiClient.post("/api/tenants/onboarding/complete/", { last_step: lastStep });
};

export const resetTutorial = async (): Promise<void> => {
  await apiClient.post("/api/tenants/onboarding/reset/");
};
