// src/components/ProtectedRoute.tsx (Simplified)
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RoutePermissions } from "../types/auth";

interface ProtectedRouteProps extends RoutePermissions {}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredUserType = [], requiredRoles = [] }) => {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  const { user } = authState;

  const hasRequiredUserType = requiredUserType.length === 0 || (user && requiredUserType.includes(user.user_type));
  const hasRequiredRole =
    requiredRoles.length === 0 || (user && user.groups.some((group) => requiredRoles.includes(group)));

  // If not authorized, redirect (consider an unauthorized page or back to login)
  if (!hasRequiredUserType || !hasRequiredRole) {
    console.warn(
      `Authorization failed: User type ${user?.user_type}, Required: ${requiredUserType}, Roles: ${user?.groups}, Required: ${requiredRoles}`
    );
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
