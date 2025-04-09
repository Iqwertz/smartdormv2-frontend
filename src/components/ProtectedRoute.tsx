// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoutePermissions } from '../types/auth';

interface ProtectedRouteProps extends RoutePermissions {}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredUserType = [],
  requiredRoles = [],
}) => {
  const { authState } = useAuth();

  if (authState.loading) {
    return <div>Loading...</div>;  // Nice loading spinner needs to be added
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const { user } = authState;

  // Check user_type
  const hasRequiredUserType =
    requiredUserType.length === 0 || (user && requiredUserType.includes(user.user_type));

  // Check roles
  const hasRequiredRole =
    requiredRoles.length === 0 ||
    (user && user.groups.some((group) => requiredRoles.includes(group)));

  if (!hasRequiredUserType || !hasRequiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;