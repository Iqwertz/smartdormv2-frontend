export interface User {
  username: string;
  name: string;
  surname: string;
  email: string;
  groups: string[];
  is_staff: boolean;
  is_superuser: boolean;
  primary_role: string | null;
  user_type: string; // e.g., "TENANT"
  is_subtenant: boolean; // Subtenants only get their own dashboard, see routesConfig
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Route permission config
export interface RoutePermissions {
  requiredUserType?: string[]; // e.g., ["TENANT"]
  requiredRoles?: string[]; // e.g., ["tenant", "wiki"]
}
