import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginRoute } from "../routesConfig";

interface ProtectedRouteProps {
  requiredGroups?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredGroups = [] }) => {
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
