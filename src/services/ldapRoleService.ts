import apiClient from "./api";

export interface LdapRoleAssignment {
  id: number;
  username: string;
  display_name: string | null;
  group_dn: string;
  group_cn: string;
  note: string | null;
  expires_at: string | null; // ISO date (YYYY-MM-DD), null = unlimited
  created_by: string;
  created_at: string; // ISO datetime
}

export interface LdapGroup {
  cn: string;
  dn: string;
  ou: string;
}

export interface LdapUser {
  username: string;
  display_name: string | null;
  email: string | null;
  employee_type: string | null;
}

export interface CreateLdapRoleAssignmentPayload {
  username: string;
  display_name?: string | null;
  group_dn: string;
  note?: string | null;
  expires_at?: string | null;
}

const ROLES_API = "/api/network/ldap-roles/";

const ldapRoleService = {
  fetchAssignments: async (): Promise<LdapRoleAssignment[]> => {
    const response = await apiClient.get<LdapRoleAssignment[]>(ROLES_API);
    return response.data;
  },

  createAssignment: async (payload: CreateLdapRoleAssignmentPayload): Promise<LdapRoleAssignment> => {
    const response = await apiClient.post<LdapRoleAssignment>(`${ROLES_API}create/`, payload);
    return response.data;
  },

  deleteAssignment: async (assignmentId: number): Promise<void> => {
    await apiClient.delete(`${ROLES_API}${assignmentId}/delete/`);
  },

  // Read live from LDAP, so the dropdowns never go stale against the directory.
  fetchGroups: async (): Promise<LdapGroup[]> => {
    const response = await apiClient.get<LdapGroup[]>("/api/network/ldap-groups/");
    return response.data;
  },

  fetchUsers: async (): Promise<LdapUser[]> => {
    const response = await apiClient.get<LdapUser[]>("/api/network/ldap-users/");
    return response.data;
  },
};

export default ldapRoleService;
