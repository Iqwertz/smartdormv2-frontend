import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginRoute, subtenantDashboardRoute } from "../routesConfig";

interface ProtectedRouteProps {
  requiredGroups?: string[];
  allowSubtenants?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredGroups = [], allowSubtenants = false }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (!authState.isAuthenticated) {
    return <Navigate to={loginRoute} state={{ from: location }} replace />;
  }

  const { user } = authState;

  if (!user || !user.groups) {
    console.error("User object or user.groups is missing in authenticated state.");
    return <Navigate to={loginRoute} state={{ from: location }} replace />;
  }

  // Subtenants are denied everywhere except the routes that opted in: their groups
  // overlap with the tenants', so the group check below cannot keep them out. They are
  // sent to their own dashboard rather than to the 403 page, which would be a dead end
  // for an account that has nowhere else to go.
  if (user.is_subtenant) {
    if (allowSubtenants) {
      return <Outlet />;
    }
    console.warn(`Authorization failed: subtenant account may not open ${location.pathname}`);
    return <Navigate to={subtenantDashboardRoute} replace />;
  }

  if (allowSubtenants && requiredGroups.length === 0) {
    // Subtenant-only route - nothing here for a tenant or Verwaltung account.
    return <Navigate to="/not-authorized" replace />;
  }

  const hasRequiredGroups =
    requiredGroups.length === 0 || // Route is public for authenticated users
    user.groups.some((group) => requiredGroups.includes(group));

  if (!hasRequiredGroups) {
    console.warn(
      `Authorization failed: User groups: ${user.groups.join(", ")}, Required groups: ${requiredGroups.join(
        ", "
      )} for path ${location.pathname}`
    );
    // Redirect to the Not Authorized page
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
